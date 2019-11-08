/** @jsx h */

import { h, Ref } from 'preact';
import { createPortal, forwardRef } from 'preact/compat';
import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  StateUpdater,
} from 'preact/hooks';
import Downshift from 'downshift/preact';

import { flatten, noop } from './utils';
import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';
import {
  AutocompleteSetters,
  AutocompleteItem,
  AutocompleteSource,
  AutocompleteState,
  AutocompleteProps,
  RequiredAutocompleteProps,
  Environment,
  Result,
  EventHandlerOptions,
} from './types';

export const defaultEnvironment: Environment =
  typeof window === 'undefined' ? ({} as Environment) : window;

let autocompleteIdCounter = 0;

/**
 * Generates a unique ID for an instance of an Autocomplete DownShift instance.
 */
function generateId(): string {
  return String(autocompleteIdCounter++);
}

function hasResults(results: Result[]): boolean {
  return results.some(result => result.suggestions.length > 0);
}

function defaultOnInput({
  query,
  getSources,
  lastStallId,
  environment,
  stallThreshold,
  state,
  setters,
  onError,
  onResults,
}: {
  query: string;
  getSources: AutocompleteProps['getSources'];
  lastStallId: number | null;
  environment: RequiredAutocompleteProps['environment'];
  stallThreshold: RequiredAutocompleteProps['stallThreshold'];
  state: AutocompleteState;
  setters: AutocompleteSetters;
  onError: RequiredAutocompleteProps['onError'];
  onResults: (options: EventHandlerOptions) => void;
}) {
  if (!getSources) {
    throw new Error(
      "The option `getSources()` is required if you don't use `onInput()`."
    );
  }

  if (lastStallId) {
    clearTimeout(lastStallId);
    setters.setIsStalled(false);
  }

  setters.setError(null);
  setters.setQuery(query);
  setters.setIsLoading(true);

  lastStallId = environment.setTimeout(() => {
    setters.setIsStalled(true);
  }, stallThreshold);

  return Promise.resolve(
    getSources({
      query,
      state,
      ...setters,
    })
  ).then(sources => {
    return Promise.all(
      sources.map(source => {
        return Promise.resolve(
          source.getSuggestions({
            query,
            state,
            ...setters,
          })
        ).then(suggestions => {
          return {
            source,
            suggestions,
          };
        });
      })
    )
      .then(results => {
        if (lastStallId) {
          clearTimeout(lastStallId);
          setters.setIsStalled(false);
        }

        setters.setIsLoading(false);
        setters.setIsOpen(true);
        setters.setResults(results);

        onResults({ state, ...setters });
      })
      .catch(error => {
        if (lastStallId) {
          clearTimeout(lastStallId);
          setters.setIsStalled(false);
        }

        setters.setIsLoading(false);
        setters.setError(error);

        onError({
          state,
          ...setters,
        });
      });
  });
}

// We don't have access to the Autocomplete source when we call `onKeyDown`
// or `onClick` because those are native browser events.
// However, we can get the source from the suggestion index.
function getSourceFromSuggestionIndex({
  highlightedIndex,
  results,
}: {
  highlightedIndex: number;
  results: Result[];
}): AutocompleteSource | undefined {
  // Given 3 sources with respectively 1, 2 and 3 suggestions: [1, 2, 3]
  // We want to get the accumulated counts:
  // [1, 1 + 2, 1 + 2 + 3] = [1, 3, 3 + 3] = [1, 3, 6]
  const accumulatedSuggestionsCount = results
    .map(result => result.suggestions.length)
    .reduce<number[]>((acc, suggestionCount, index) => {
      const previousValue = acc[index - 1] || 0;
      const nextValue = previousValue + suggestionCount;

      acc.push(nextValue);

      return acc;
    }, []);

  // Based on the accumulated counts, we can infer the index of the result.
  const resultIndex = accumulatedSuggestionsCount.reduce((acc, current) => {
    if (current <= highlightedIndex) {
      return acc + 1;
    }

    return acc;
  }, 0);

  const result: Result | undefined = results[resultIndex];

  return result ? result.source : undefined;
}

function getCompletion({
  highlightedIndex,
  showCompletion,
  results,
  query,
  state,
}: {
  highlightedIndex: number;
  showCompletion: boolean;
  results: Result[];
  query: string;
  state: AutocompleteState;
}): string {
  if (!showCompletion) {
    return '';
  }

  const suggestion = flatten(results.map(result => result.suggestions))[
    Math.max(0, highlightedIndex)
  ];
  const source = getSourceFromSuggestionIndex({
    highlightedIndex: Math.max(0, highlightedIndex),
    results,
  });

  if (!suggestion || !source) {
    return '';
  }

  const currentSuggestion = source.getInputValue({
    suggestion,
    state,
  });

  // The completion should appear only if the _first_ characters of the query
  // match with the suggestion.
  if (
    query &&
    currentSuggestion.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) ===
      0
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

function UncontrolledAutocomplete(
  props: AutocompleteProps,
  ref: Ref<AutocompleteSetters>
) {
  const { initialState = {} } = props;

  const [query, setQuery] = useState<AutocompleteState['query']>(
    initialState.query || ''
  );
  const [results, setResults] = useState<AutocompleteState['results']>(
    initialState.results || []
  );
  const [isOpen, setIsOpen] = useState<boolean>(initialState.isOpen || false);
  const [isLoading, setIsLoading] = useState<AutocompleteState['isLoading']>(
    initialState.isLoading || false
  );
  const [isStalled, setIsStalled] = useState<AutocompleteState['isStalled']>(
    initialState.isStalled || false
  );
  const [error, setError] = useState<AutocompleteState['error'] | null>(
    initialState.error || null
  );
  const [context, setContext] = useState<AutocompleteState['context']>(
    initialState.context || {}
  );

  const setMergedContext: StateUpdater<
    AutocompleteState['context']
  > = context =>
    setContext(previousContext => {
      return {
        ...previousContext,
        ...context,
      };
    });

  // Expose the component setters to the external API.
  useImperativeHandle(ref, () => {
    return {
      setQuery,
      setResults,
      setIsOpen,
      setIsLoading,
      setIsStalled,
      setError,
      setContext: setMergedContext,
    };
  });

  return (
    <ControlledAutocomplete
      {...props}
      query={query}
      setQuery={setQuery}
      results={results}
      setResults={setResults}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      isStalled={isStalled}
      setIsStalled={setIsStalled}
      error={error}
      setError={setError}
      context={context}
      setContext={setContext}
    />
  );
}

interface ControlledAutocompleteProps
  extends AutocompleteProps,
    AutocompleteState {
  query: string;
  results: Result[];
  setQuery: StateUpdater<AutocompleteState['query']>;
  setResults: StateUpdater<AutocompleteState['results']>;
  setIsOpen: StateUpdater<AutocompleteState['isOpen']>;
  setIsLoading: StateUpdater<AutocompleteState['isLoading']>;
  setIsStalled: StateUpdater<AutocompleteState['isStalled']>;
  setError: StateUpdater<AutocompleteState['error']>;
  setContext: StateUpdater<AutocompleteState['context']>;
}

function ControlledAutocomplete(props: ControlledAutocompleteProps) {
  let lastStallId: number | null = null;

  const {
    // Props.
    container,
    placeholder = '',
    minLength = 1,
    showCompletion = false,
    autofocus = false,
    defaultHighlightedIndex = 0,
    stallThreshold = 300,
    keyboardShortcuts = [],
    getSources,
    environment = defaultEnvironment,
    dropdownContainer = environment.document.body,
    dropdownPosition = 'left',
    templates = {},
    transformResultsRender = (results: JSX.Element[]) => results,
    onFocus = noop,
    onClick = noop,
    onKeyDown = noop,
    onError = ({ state }) => {
      throw state.error;
    },
    onInput = ({ query, onResults = noop }) =>
      defaultOnInput({
        query,
        getSources,
        lastStallId,
        environment,
        stallThreshold,
        state: getState(),
        onResults,
        setters,
        onError,
      }),
    // State.
    query,
    setQuery,
    results,
    setResults,
    isOpen,
    setIsOpen,
    isLoading,
    setIsLoading,
    isStalled,
    setIsStalled,
    error,
    setError,
    context,
    setContext,
  } = props;

  const [dropdownRect, setDropdownRect] = useState<
    Pick<ClientRect, 'top' | 'left'> | undefined
  >(undefined);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const setters = {
    setQuery,
    setResults,
    setIsOpen,
    setIsLoading,
    setIsStalled,
    setError,
    setContext,
  };

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
  }, [environment]);

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
      context,
    };
  }

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

  const isQueryLongEnough = query.length >= minLength;
  const shouldOpen = isOpen && isQueryLongEnough && hasResults(results);

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

        onInput({
          query: suggestionValue,
          state: getState(),
          onResults({ setIsOpen }) {
            if (!source.onSelect) {
              setIsOpen(false);
            } else {
              const currentState = getState();

              source.onSelect({
                suggestion,
                suggestionValue,
                source,
                state: currentState,
                ...setters,
              });
            }
          },
          ...setters,
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
              completion={getCompletion({
                highlightedIndex,
                showCompletion,
                query,
                results,
                state: getState(),
              })}
              internalState={getState()}
              setters={setters}
              onInputRef={inputRef}
              getInputProps={getInputProps}
              onFocus={() => {
                if (isQueryLongEnough) {
                  setIsOpen(true);

                  // If `minLength` is set to 0, and no queries have been
                  // performed yet, you still want to show the results when
                  // you focus the input.
                  if (!hasResults(results)) {
                    onInput({
                      query,
                      state: getState(),
                      ...setters,
                    });
                  }
                }

                onFocus({
                  state: getState(),
                  ...setters,
                });
              }}
              onKeyDown={(event: KeyboardEvent) => {
                const suggestion = flatten(
                  results.map(result => result.suggestions)
                )[Math.max(0, highlightedIndex)];
                const source = getSourceFromSuggestionIndex({
                  highlightedIndex: Math.max(0, highlightedIndex),
                  results,
                });

                const currentState = getState();

                if (suggestion && source) {
                  onKeyDown(event, {
                    suggestion,
                    suggestionValue: source.getInputValue({
                      suggestion,
                      state: currentState,
                    }),
                    source,
                    state: currentState,
                    ...setters,
                  });
                } else {
                  onKeyDown(event, { state: currentState, ...setters });
                }

                if (event.key === 'Escape') {
                  setIsOpen(false);

                  if (!shouldOpen) {
                    onInput({
                      query: '',
                      state: getState(),
                      ...setters,
                    });
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

                    const nextQuery = source.getInputValue({
                      suggestion,
                      state: getState(),
                    });

                    if (query !== nextQuery) {
                      onInput({
                        query: nextQuery,
                        state: getState(),
                        ...setters,
                      });

                      setHighlightedIndex(defaultHighlightedIndex);
                    }
                  }
                }
              }}
              onInput={(event: KeyboardEvent) => {
                const query = (event.target as HTMLInputElement).value;

                if (query.length >= minLength) {
                  setIsOpen(true);

                  onInput({
                    query,
                    state: getState(),
                    ...setters,
                  });
                } else {
                  if (lastStallId) {
                    clearTimeout(lastStallId);
                    setIsStalled(false);
                  }

                  setError(null);
                  setQuery(query);
                  setIsLoading(false);
                  setIsOpen(false);
                  setResults(
                    results.map(result => ({
                      ...result,
                      suggestions: [],
                    }))
                  );
                }
              }}
              onReset={event => {
                event.preventDefault();

                onInput({
                  query: '',
                  state: getState(),
                  ...setters,
                });

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
                context={context}
                results={results}
                templates={templates}
                transformResultsRender={transformResultsRender}
                setters={setters}
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

export const Autocomplete = forwardRef(UncontrolledAutocomplete);
