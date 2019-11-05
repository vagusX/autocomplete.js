/** @jsx h */

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import Downshift from 'downshift/preact';

import { flatten, noop } from './utils';
import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';
import {
  Environment,
  Result,
  SetState,
  AutocompleteProps,
  AutocompleteState,
  AutocompleteSource,
  AutocompleteItem,
} from './types';

function getSourcesResults(options: {
  sources: AutocompleteSource[];
  query: string;
  state: AutocompleteState;
  setState: SetState;
}): Promise<Result[]> {
  const { sources, query, state, setState } = options;

  return Promise.all(
    sources.map(source => {
      if (source.onInput) {
        source.onInput({ state, setState });
      }

      return Promise.resolve(
        source.getSuggestions({
          query,
          state,
          setState,
        })
      ).then(suggestions => {
        return {
          source,
          suggestions,
        };
      });
    })
  );
}

export const defaultEnvironment =
  typeof window === 'undefined' ? ({} as Environment) : window;

let autocompleteIdCounter = 0;

/**
 * Generates a unique ID for an instance of an Autocomplete DownShift instance.
 */
function generateId(): string {
  return String(autocompleteIdCounter++);
}

export function Autocomplete(props: AutocompleteProps) {
  const {
    container,
    placeholder = '',
    minLength = 1,
    showCompletion = false,
    autofocus = false,
    initialState = {},
    defaultHighlightedIndex = 0,
    stallThreshold = 300,
    keyboardShortcuts = [],
    getSources,
    templates = {},
    environment = defaultEnvironment,
    dropdownContainer = environment.document.body,
    dropdownPosition = 'left',
    onFocus = noop,
    onClick = noop,
    onKeyDown = noop,
    onEmpty = noop,
    onError = ({ state }) => {
      throw state.error;
    },
  } = props;

  const [query, setQuery] = useState<AutocompleteState['query']>(
    initialState.query || ''
  );
  const [results, setResults] = useState<AutocompleteState['results']>(
    initialState.results || []
  );
  const [isOpen, setIsOpen] = useState<AutocompleteState['isOpen']>(
    initialState.isOpen || false
  );
  const [isLoading, setIsLoading] = useState<AutocompleteState['isLoading']>(
    initialState.isLoading || false
  );
  const [isStalled, setisStalled] = useState<AutocompleteState['isStalled']>(
    initialState.isStalled || false
  );
  const [error, setError] = useState<AutocompleteState['error'] | null>(
    initialState.error || null
  );
  const [metadata, setMetadata] = useState<AutocompleteState['metadata']>(
    initialState.metadata || {}
  );
  const [dropdownRect, setDropdownRect] = useState<
    Pick<ClientRect, 'top' | 'left'> | undefined
  >(undefined);

  let setisStalledId: number | null = null;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Perform the query if coming from the initial state.
    if (initialState.query) {
      performQuery(initialState.query, isOpen);
    }
  }, []);

  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent): void {
      if (!inputRef.current) {
        return;
      }

      const element = event.target as HTMLElement;
      const tagName = element.tagName;

      // Do not trigger the focus if we're already editing text.
      if (
        element.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'SELECT' ||
        tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Do not trigger the focus if the shortcut is not correct.
      if (keyboardShortcuts.indexOf(event.key) === -1) {
        return;
      }

      inputRef.current.focus();

      event.stopPropagation();
      event.preventDefault();
    }

    if (keyboardShortcuts.length > 0) {
      environment.addEventListener('keydown', onGlobalKeyDown);
    }

    return () => {
      if (keyboardShortcuts.length > 0) {
        environment.removeEventListener('keydown', onGlobalKeyDown);
      }
    };
  }, [environment, keyboardShortcuts]);

  useEffect(() => {
    environment.addEventListener('resize', onResize);

    return () => {
      environment.removeEventListener('resize', onResize);
    };
  }, [environment, onResize]);

  useEffect(() => {
    // We need to track the container position because the dropdown position is
    // computed based on the container position.
    onResize();
  }, [container, dropdownContainer]);

  function getState(): AutocompleteState {
    return {
      query,
      results,
      isOpen,
      isLoading,
      isStalled,
      error,
      metadata,
    };
  }

  const setState: SetState = nextState => {
    if (nextState.query !== undefined) {
      setQuery(nextState.query);
      performQuery(nextState.query);
    }
    if (nextState.results) {
      setResults(nextState.results);
    }
    if (nextState.isOpen !== undefined) {
      setIsOpen(nextState.isOpen);
    }
    if (nextState.isLoading !== undefined) {
      setIsLoading(nextState.isLoading);
    }
    if (nextState.isStalled !== undefined) {
      setisStalled(nextState.isStalled);
    }
    if (nextState.error !== undefined) {
      setError(nextState.error);
    }
    if (nextState.metadata !== undefined) {
      setMetadata({ ...metadata, ...nextState.metadata });
    }
  };

  function onResize(): void {
    const nextContainerRect = container.getBoundingClientRect();
    const nextDropdownRect = dropdownContainer.getBoundingClientRect();

    const newDropdownRect = {
      top: nextContainerRect.top + nextContainerRect.height,
      left:
        dropdownPosition === 'right'
          ? nextContainerRect.width +
            nextContainerRect.left -
            nextDropdownRect.width
          : nextContainerRect.left,
    };

    setDropdownRect(newDropdownRect);
  }

  function performQuery(query: string, nextIsOpen: boolean = true) {
    if (setisStalledId) {
      clearTimeout(setisStalledId);
      setisStalled(false);
    }

    setError(null);
    setQuery(query);

    if (query.length < minLength) {
      setIsLoading(false);
      setIsOpen(false);
      setResults(
        results.map(result => ({
          ...result,
          suggestions: [],
        }))
      );

      return Promise.resolve();
    }

    setIsLoading(true);

    setisStalledId = environment.setTimeout(() => {
      setisStalled(true);
    }, stallThreshold);

    return Promise.resolve(
      getSources({
        query,
        state: getState(),
        setState,
      })
    ).then(sources => {
      return getSourcesResults({
        query,
        sources,
        state: getState(),
        setState,
      })
        .then(results => {
          if (setisStalledId) {
            clearTimeout(setisStalledId);
            setisStalled(false);
          }

          setIsLoading(false);
          setIsOpen(nextIsOpen);
          setResults(results);

          const hasResults = results.some(
            result => result.suggestions.length > 0
          );

          if (!hasResults) {
            onEmpty({ state: getState(), setState });
          }
        })
        .catch(error => {
          if (setisStalledId) {
            clearTimeout(setisStalledId);
            setisStalled(false);
          }

          setIsLoading(false);
          setError(error);

          onError({
            state: getState(),
            setState,
          });
        });
    });
  }

  function getSourceFromHighlightedIndex(
    highlightedIndex: number
  ): AutocompleteSource | undefined {
    const resultsSizes = results
      .map(result => result.suggestions)
      .reduce<number[]>((acc, suggestions) => {
        acc.push(suggestions.length + acc.reduce((a, b) => a + b, 0));

        return acc;
      }, []);

    const resultIndex = resultsSizes.reduce((acc, current) => {
      if (current <= highlightedIndex) {
        return acc + 1;
      }

      return acc;
    }, 0);

    const result: Result | undefined = results[resultIndex];

    return result ? result.source : undefined;
  }

  function getCompletion(highlightedIndex: number) {
    if (!showCompletion) {
      return '';
    }

    const suggestion = flatten(results.map(result => result.suggestions))[
      Math.max(0, highlightedIndex)
    ];
    const source = getSourceFromHighlightedIndex(Math.max(0, highlightedIndex));

    if (!suggestion || !source) {
      return '';
    }

    const currentSuggestion = source.getSuggestionValue({
      suggestion,
      state: getState(),
    });

    // The completion should appear only if the _first_ characters of the query
    // match with the suggestion.
    if (
      query &&
      currentSuggestion
        .toLocaleLowerCase()
        .indexOf(query.toLocaleLowerCase()) === 0
    ) {
      // If the query typed has a different case than the suggestion, we want
      // to show the completion matching the case of the query. This makes both
      // strings overlap correctly.
      // Example:
      //  - query: 'Gui'
      //  - suggestion: 'guitar'
      //  => completion: 'Guitar'
      return query + currentSuggestion.slice(query.length);
    }

    return '';
  }

  const isQueryLongEnough = query.length >= minLength;
  const hasResults = results.some(result => result.suggestions.length > 0);
  const shouldOpen =
    isOpen &&
    // We don't want to open the dropdown when the results
    // are loading coming from an empty input.
    // !isStalled &&
    // However, we do want to leave the dropdown open when it's
    // already open because there are results displayed. Otherwise,
    // it would result in a flashy behavior.
    isQueryLongEnough &&
    hasResults;

  return (
    <Downshift
      id={`autocomplete-${generateId()}`}
      environment={environment}
      defaultHighlightedIndex={defaultHighlightedIndex}
      itemToString={(item: AutocompleteItem) => {
        return item ? item.suggestionValue : '';
      }}
      onSelect={(item: AutocompleteItem) => {
        if (!item) {
          return;
        }

        const { suggestion, suggestionValue, source } = item;

        performQuery(suggestionValue, false).then(() => {
          if (source.onSelect) {
            const currentState = getState();

            source.onSelect({
              suggestion,
              suggestionValue,
              source,
              state: currentState,
              setState,
            });
          } else {
            setIsOpen(false);
          }
        });
      }}
      onOuterClick={() => {
        setIsOpen(false);
      }}
      scrollIntoView={(itemNode: HTMLElement) => {
        if (itemNode) {
          itemNode.scrollIntoView(false);
        }
      }}
    >
      {({
        highlightedIndex,
        setHighlightedIndex,
        getInputProps,
        getItemProps,
        getMenuProps,
      }) => {
        return (
          <div
            className={[
              'algolia-autocomplete',
              isStalled && 'algolia-autocomplete--stalled',
              error && 'algolia-autocomplete--errored',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <SearchBox
              placeholder={placeholder}
              autofocus={autofocus}
              completion={getCompletion(highlightedIndex)}
              internalState={getState()}
              internalSetState={setState}
              onInputRef={inputRef}
              getInputProps={getInputProps}
              onFocus={() => {
                if (isQueryLongEnough) {
                  setIsOpen(true);
                }

                // We should still perform a query if the minimal input length
                // is set to 0 so that the menu shows updated results.
                if (minLength === 0 && !query) {
                  performQuery('');
                }

                onFocus({
                  state: getState(),
                  setState,
                });
              }}
              onKeyDown={(event: KeyboardEvent) => {
                const suggestion = flatten(
                  results.map(result => result.suggestions)
                )[Math.max(0, highlightedIndex)];
                const source = getSourceFromHighlightedIndex(
                  Math.max(0, highlightedIndex)
                );

                const currentState = getState();

                if (suggestion && source) {
                  onKeyDown(event, {
                    suggestion,
                    suggestionValue: source.getSuggestionValue({
                      suggestion,
                      state: currentState,
                    }),
                    source,
                    state: currentState,
                    setState,
                  });
                } else {
                  onKeyDown(event, { state: currentState, setState });
                }

                if (event.key === 'Escape') {
                  setIsOpen(false);

                  if (!shouldOpen) {
                    setQuery('');
                  }
                } else if (
                  event.key === 'Tab' ||
                  // When the user hits the right arrow and is at the end of
                  // the typed query only, we want to validate the completion.
                  (event.key === 'ArrowRight' &&
                    (event.target as HTMLInputElement).selectionStart ===
                      query.length)
                ) {
                  if (shouldOpen && suggestion && source) {
                    event.preventDefault();

                    const nextQuery = source.getSuggestionValue({
                      suggestion,
                      state: getState(),
                    });

                    if (query !== nextQuery) {
                      performQuery(nextQuery);

                      setHighlightedIndex(defaultHighlightedIndex);
                    }
                  }
                }
              }}
              onInput={(event: KeyboardEvent) => {
                performQuery((event.target as HTMLInputElement).value);
              }}
              onReset={event => {
                event.preventDefault();
                setQuery('');

                if (minLength === 0) {
                  performQuery('');
                }

                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              onSubmit={(event: Event) => {
                event.preventDefault();
                setIsOpen(false);

                if (inputRef.current) {
                  inputRef.current.blur();
                }
              }}
            />

            {createPortal(
              <Dropdown
                position={dropdownRect}
                hidden={!shouldOpen}
                isOpen={isOpen}
                isStalled={isStalled}
                isLoading={isLoading}
                query={query}
                error={error}
                metadata={metadata}
                results={results}
                templates={templates}
                internalSetState={setState}
                onClick={onClick}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
              />,
              dropdownContainer
            )}
          </div>
        );
      }}
    </Downshift>
  );
}
