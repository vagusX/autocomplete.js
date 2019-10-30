/** @jsx h */

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import Downshift from 'downshift/preact';

import { Environment, defaultEnvironment } from '.';
import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';
import { Template } from './Template';

export type Suggestion = any;

interface AutocompleteTemplates {
  header?: Template;
  footer?: Template;
}

interface AutocompleteSourceTemplates {
  empty?: Template;
  suggestion: Template<{ suggestion: Suggestion }>;
  header?: Template;
  footer?: Template;
}

export interface AutocompleteSource {
  // @TODO: see if we need a `key`
  key?: string;
  getSuggestionValue({
    suggestion,
    state,
  }: {
    suggestion: Suggestion;
    state: AutocompleteState;
  }): string;
  getSuggestions(options: {
    query: string;
    state: AutocompleteState;
    setState(nextState: Partial<AutocompleteState>): void;
  }): Suggestion[] | Promise<Suggestion[]>;
  templates: AutocompleteSourceTemplates;
  onInput?: (options: EventHandlerOptions) => void;
  onSelect?: (options: ItemEventHandlerOptions) => void;
}

export interface AutocompleteItem {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
}

interface EventHandlerOptions {
  state: AutocompleteState;
  setState(nextState: Partial<AutocompleteState>): void;
}

interface ItemEventHandlerOptions extends EventHandlerOptions {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
}

export interface AutocompleteProps {
  /**
   * The text that appears in the search box input when there is no query.
   */
  placeholder?: string;
  /**
   * The number of milliseconds before the autocomplete experience is considered
   * as stalled.
   *
   * @default 300
   */
  stalledDelay?: number;
  /**
   * The default item index to pre-select.
   *
   * @default 0
   */
  defaultHighlightedIndex?: number;
  /**
   * The keyboard shortcuts keys to focus the input.
   */
  keyboardShortcuts?: string[];
  /**
   * The minimum number of characters long the autocomplete opens.
   *
   * @default 1
   */
  minLength?: number;
  /**
   * Focus the search box when the page is loaded.
   *
   * @default false
   */
  autofocus?: boolean;
  /**
   * Whether to show the highlighted suggestion as completion in the input.
   *
   * @default false
   */
  showCompletion?: boolean;
  /**
   * The container for the autocomplete dropdown.
   *
   * @default environment.document.body
   */
  dropdownContainer?: HTMLElement;
  /**
   * The initial state to apply when the page is loaded.
   */
  initialState?: Partial<AutocompleteState>;
  /**
   * The sources to get the suggestions from.
   */
  getSources(options: { query: string }): AutocompleteSource[];
  templates?: AutocompleteTemplates;
  environment?: Environment;
  onFocus?: (options: EventHandlerOptions) => void;
  onClick?: (event: MouseEvent, options: ItemEventHandlerOptions) => void;
  onKeyDown?: (
    event: KeyboardEvent,
    options: EventHandlerOptions & Partial<ItemEventHandlerOptions>
  ) => void;
  onError?: (options: EventHandlerOptions) => void;
}

export type RequiredAutocompleteProps = Required<AutocompleteProps>;

export interface AutocompleteState {
  query: string;
  results: Suggestion[][];
  isOpen: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error: Error | null;
  metadata: { [key: string]: any };
}

let autocompleteIdCounter = 0;

/**
 * Generates a unique ID for an instance of a Autocomplete DownShift instance.
 */
function generateId(): string {
  return String(autocompleteIdCounter++);
}

export function Autocomplete(props: AutocompleteProps) {
  const {
    placeholder = '',
    minLength = 1,
    showCompletion = false,
    autofocus = false,
    initialState = {},
    defaultHighlightedIndex = 0,
    stalledDelay = 300,
    keyboardShortcuts = [],
    getSources,
    templates = {},
    environment = defaultEnvironment,
    dropdownContainer = environment.document.body,
    onFocus = () => {},
    onClick = () => {},
    onKeyDown = () => {},
    onError = ({ state }) => {
      throw state.error;
    },
  } = props;

  const [query, setQuery] = useState<AutocompleteState['query']>(
    initialState.query || ''
  );
  const [results, setResults] = useState<AutocompleteState['results']>([]);
  const [isOpen, setIsOpen] = useState<AutocompleteState['isOpen']>(
    initialState.isOpen || false
  );
  const [isLoading, setIsLoading] = useState<AutocompleteState['isLoading']>(
    initialState.isLoading || false
  );
  const [isStalled, setIsStalled] = useState<AutocompleteState['isStalled']>(
    initialState.isStalled || false
  );
  const [error, setError] = useState<AutocompleteState['error'] | null>(
    initialState.error || null
  );
  const [metadata, setMetadata] = useState<AutocompleteState['metadata']>({});
  const [sources, setSources] = useState<AutocompleteSource[]>(
    getSources({ query })
  );

  let setIsStalledId: number | null = null;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Perform the query if coming from the initial state.
    if (initialState.query) {
      performQuery(initialState.query, isOpen);
    }
  }, []);

  useEffect(() => {
    if (keyboardShortcuts.length > 0) {
      environment.addEventListener('keydown', onGlobalKeyDown);
    }

    return () => {
      if (keyboardShortcuts.length > 0) {
        environment.removeEventListener('keydown', onGlobalKeyDown);
      }
    };
  }, [environment, keyboardShortcuts]);

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

  function setState(nextState: Partial<AutocompleteState>): void {
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
      setIsStalled(nextState.isStalled);
    }
    if (nextState.error !== undefined) {
      setError(nextState.error);
    }
    if (nextState.metadata !== undefined) {
      setMetadata({ ...metadata, ...nextState.metadata });
    }
  }

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

  function performQuery(query: string, nextIsOpen: boolean = true) {
    if (setIsStalledId) {
      clearTimeout(setIsStalledId);
      setIsStalled(false);
    }

    setError(null);
    setQuery(query);

    if (query.length < minLength) {
      setIsLoading(false);
      setIsOpen(false);
      setSources(getSources({ query }));
      setResults([]);

      return Promise.resolve();
    }

    setIsLoading(true);

    setIsStalledId = environment.setTimeout(() => {
      setIsStalled(true);
    }, stalledDelay);

    return Promise.all(
      sources.map(source => {
        if (source.onInput) {
          source.onInput({ state: getState(), setState });
        }

        return source.getSuggestions({
          query,
          state: getState(),
          setState,
        });
      })
    )
      .then(results => {
        if (setIsStalledId) {
          clearTimeout(setIsStalledId);
          setIsStalled(false);
        }

        setIsLoading(false);
        setIsOpen(nextIsOpen);
        setResults(results);
        setSources(getSources({ query }));
      })
      .catch(error => {
        if (setIsStalledId) {
          clearTimeout(setIsStalledId);
          setIsStalled(false);
        }

        setIsLoading(false);
        setError(error);

        onError({
          state: getState(),
          setState,
        });
      });
  }

  function getSourceFromHighlightedIndex(
    highlightedIndex: number
  ): AutocompleteSource {
    const resultsSizes = results.reduce<number[]>((acc, result: number[]) => {
      acc.push(result.length + acc.reduce((a, b) => a + b, 0));
      return acc;
    }, []);
    const sourceNumber = resultsSizes.reduce((acc, current) => {
      if (current <= highlightedIndex) {
        return acc + 1;
      }

      return acc;
    }, 0);

    return sources[sourceNumber];
  }

  function getCompletion(highlightedIndex: number) {
    if (!showCompletion) {
      return '';
    }

    const suggestion = results.flat()[Math.max(0, highlightedIndex)];
    const source = getSourceFromHighlightedIndex(Math.max(0, highlightedIndex));

    if (!suggestion || !source) {
      return '';
    }

    const currentSuggestion = source.getSuggestionValue({
      suggestion,
      state: getState(),
    });

    if (
      query &&
      currentSuggestion
        .toLocaleLowerCase()
        .indexOf(query.toLocaleLowerCase()) === 0
    ) {
      return query + currentSuggestion.slice(query.length);
    }

    return '';
  }

  const canOpen = query.length >= minLength;
  const shouldOpen =
    isOpen &&
    // We don't want to open the dropdown when the results
    // are loading coming from an empty input.
    // !isStalled &&
    // However, we do want to leave the dropdown open when it's
    // already open because there are results displayed. Otherwise,
    // it would result in a flashy behavior.
    canOpen &&
    // @TODO: should hiding the menu when no results be an option?
    results.some((result: Suggestion[]) => result.length > 0);

  return (
    <Downshift
      id={`autocomplete-${generateId()}`}
      itemToString={(item: AutocompleteItem) => {
        return item
          ? item.source.getSuggestionValue({
              suggestion: item.suggestion,
              state: getState(),
            })
          : '';
      }}
      defaultHighlightedIndex={defaultHighlightedIndex}
      onSelect={(item: AutocompleteItem) => {
        if (!item) {
          return;
        }

        const { suggestion, source } = item;

        performQuery(
          source.getSuggestionValue({ suggestion, state: getState() }),
          false
        ).then(() => {
          if (source.onSelect) {
            const currentState = getState();

            source.onSelect({
              suggestion: suggestion,
              suggestionValue: source.getSuggestionValue({
                suggestion,
                state: currentState,
              }),
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
                if (canOpen) {
                  setIsOpen(true);
                }

                if (minLength === 0 && !query) {
                  performQuery('');
                }

                onFocus({
                  state: getState(),
                  setState,
                });
              }}
              onKeyDown={(event: KeyboardEvent) => {
                const suggestion: any = results.flat()[
                  Math.max(0, highlightedIndex)
                ];
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
                  if (shouldOpen) {
                    setIsOpen(false);
                  } else {
                    setQuery('');
                    setIsOpen(false);
                  }
                } else if (
                  event.key === 'Tab' ||
                  (event.key === 'ArrowRight' &&
                    (event.target! as HTMLInputElement).selectionStart ===
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
                performQuery((event.target as any).value);
              }}
              onReset={event => {
                event.preventDefault();
                setQuery('');

                if (minLength === 0) {
                  performQuery('');
                }

                inputRef.current && inputRef.current.focus();
              }}
              onSubmit={(event: Event) => {
                event.preventDefault();
                setIsOpen(false);
                inputRef.current && inputRef.current.blur();
              }}
            />

            {createPortal(
              <Dropdown
                hidden={!shouldOpen}
                internalState={getState()}
                internalSetState={setState}
                sources={sources}
                templates={templates}
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
