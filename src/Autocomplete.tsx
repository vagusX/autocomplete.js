/** @jsx h */

import { h, Component } from 'preact';
import Downshift from 'downshift/preact';

import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';
import { Template } from './Template';

export type Suggestion = any;

type AutocompleteSourceTemplates = {
  empty?: Template;
  suggestion: Template<{ suggestion: Suggestion }>;
  header?: Template;
  footer?: Template;
};

export interface AutocompleteSource {
  key?: string;
  getSuggestionValue({
    suggestion,
    state,
  }: {
    suggestion: Suggestion;
    state: AutocompleteState;
  }): string;
  getSuggestions({
    query,
  }: {
    query: string;
  }): Suggestion[] | Promise<Suggestion[]>;
  templates: AutocompleteSourceTemplates;
}

export type AutocompleteItem = {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
};

interface EventHandlerOptions {
  state: AutocompleteState;
  setState(nextState: Partial<AutocompleteState>): void;
}

interface ItemEventHandlerOptions extends EventHandlerOptions {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
}

interface EventItemEventHandlerOptions<TEvent = Event>
  extends ItemEventHandlerOptions {
  event: TEvent;
}

export interface OptionalAutocompleteOptions {
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
   * Whether to show the highlighted suggestion as hint in the input.
   *
   * @default false
   */
  showHint?: boolean;
  /**
   * The sources to get the suggestions from.
   */
  sources?: AutocompleteSource[];
  onFocus?: (options: EventHandlerOptions) => void;
  onSelect?: (options: ItemEventHandlerOptions) => void;
  onClick?: (options: EventItemEventHandlerOptions<MouseEvent>) => void;
  onKeyDown?: (options: EventItemEventHandlerOptions<KeyboardEvent>) => void;
  onError?: (options: EventHandlerOptions) => void;
}

export interface AutocompleteState {
  query: string;
  results: Suggestion[][];
  isOpen: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error: Error | null;
}

let autocompleteIdCounter = 0;

/**
 * Generates a unique ID for an instance of a Autocomplete DownShift instance.
 */
function generateId(): string {
  return String(autocompleteIdCounter++);
}

const defaultProps: OptionalAutocompleteOptions = {
  placeholder: '',
  minLength: 1,
  showHint: false,
  defaultHighlightedIndex: 0,
  stalledDelay: 300,
  keyboardShortcuts: [],
  sources: [],
  onSelect: ({ setState }) => {
    setState({
      isOpen: false,
    });
  },
  onFocus: () => {},
  onClick: () => {},
  onKeyDown: () => {},
  onError: ({ state }) => {
    throw state.error;
  },
};

export type AutocompleteProps = Required<OptionalAutocompleteOptions>;

export class Autocomplete extends Component<
  AutocompleteProps,
  AutocompleteState
> {
  static defaultProps = defaultProps;
  setIsStalledId: number | null = null;
  inputRef: HTMLInputElement | null = null;

  state = {
    query: '',
    results: [],
    isOpen: false,
    isLoading: false,
    isStalled: false,
    error: null,
  };

  componentDidMount() {
    if (this.props.keyboardShortcuts.length > 1) {
      window.addEventListener('keydown', this.onGlobalKeyDown);
    }
  }

  componentWillUnmount() {
    if (this.props.keyboardShortcuts.length > 1) {
      window.removeEventListener('keydown', this.onGlobalKeyDown);
    }
  }

  onGlobalKeyDown = (event: KeyboardEvent) => {
    if (!this.inputRef) {
      return;
    }

    const element = (event.target || event.srcElement) as HTMLElement;
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
    if (this.props.keyboardShortcuts.indexOf(event.key) === -1) {
      return;
    }

    this.inputRef.focus();

    event.stopPropagation();
    event.preventDefault();
  };

  getSourceFromHighlightedIndex = (
    highlightedIndex: number
  ): AutocompleteSource => {
    const resultsSizes = this.state.results.reduce<number[]>(
      (acc, result: number[]) => {
        acc.push(result.length + acc.reduce((a, b) => a + b, 0));
        return acc;
      },
      []
    );
    const sourceNumber = resultsSizes.reduce((acc, current) => {
      if (current <= highlightedIndex) {
        return acc + 1;
      }

      return acc;
    }, 0);

    return this.props.sources[sourceNumber];
  };

  performQuery = (query: string) => {
    if (this.setIsStalledId) {
      clearTimeout(this.setIsStalledId);
      this.setState({
        isStalled: false,
      });
    }

    if (query.length < this.props.minLength) {
      this.setState({
        isLoading: false,
        isOpen: false,
        query,
        results: [],
        error: null,
      });

      return;
    }

    this.setState({
      isLoading: true,
      error: null,
      query,
    });

    if (typeof window !== 'undefined') {
      this.setIsStalledId = window.setTimeout(() => {
        this.setState({
          isStalled: true,
        });
      }, this.props.stalledDelay);
    }

    Promise.all(
      this.props.sources.map(source =>
        source.getSuggestions({
          query: this.state.query,
        })
      )
    )
      .then(results => {
        if (this.setIsStalledId) {
          clearTimeout(this.setIsStalledId);
          this.setState({
            isStalled: false,
          });
        }

        this.setState({
          results,
          isLoading: false,
          isOpen: true,
        });
      })
      .catch(error => {
        if (this.setIsStalledId) {
          clearTimeout(this.setIsStalledId);
          this.setState({
            isStalled: false,
          });
        }

        this.setState({
          isLoading: false,
          error,
        });

        this.props.onError({
          state: this.state,
          setState: this.setState.bind(this),
        });
      });
  };

  getHint = (highlightedIndex: number) => {
    if (!this.props.showHint) {
      return '';
    }

    const suggestion = this.state.results.flat()[Math.max(0, highlightedIndex)];
    const source = this.getSourceFromHighlightedIndex(
      Math.max(0, highlightedIndex)
    );

    if (!suggestion || !source) {
      return '';
    }

    const currentSuggestion = source.getSuggestionValue({
      suggestion,
      state: this.state,
    });

    if (
      // @TODO: do we want to show hints without query?
      (!this.state.query && highlightedIndex >= 0) ||
      (this.state.query &&
        currentSuggestion
          .toLocaleLowerCase()
          .indexOf(this.state.query.toLocaleLowerCase()) === 0)
    ) {
      return (
        this.state.query + currentSuggestion.slice(this.state.query.length)
      );
    }

    return '';
  };

  render() {
    const canOpen = this.state.query.length >= this.props.minLength;
    const isOpen =
      this.state.isOpen &&
      // We don't want to open the dropdown when the results
      // are loading coming from an empty input.
      // !this.state.isStalled &&
      // However, we do want to leave the dropdown open when it's
      // already open because there are results displayed. Otherwise,
      // it would result in a flashy behavior.
      canOpen;

    return (
      <Downshift
        id={`autocomplete-${generateId()}`}
        itemToString={(item: AutocompleteItem) => {
          return item
            ? item.source.getSuggestionValue({
                suggestion: item.suggestion,
                state: this.state,
              })
            : '';
        }}
        defaultHighlightedIndex={this.props.defaultHighlightedIndex}
        onSelect={(item: AutocompleteItem) => {
          if (item) {
            const { suggestion, source } = item;

            this.performQuery(
              source.getSuggestionValue({ suggestion, state: this.state })
            );

            this.props.onSelect({
              suggestion: suggestion,
              suggestionValue: source.getSuggestionValue({
                suggestion,
                state: this.state,
              }),
              source,
              state: this.state,
              setState: this.setState.bind(this),
            });
          }
        }}
        onOuterClick={() => {
          this.setState({
            isOpen: false,
          });
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
                this.state.isStalled && 'algolia-autocomplete--stalled',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/*
          // @ts-ignore @TODO: fix refs error */}
              <SearchBox
                placeholder={this.props.placeholder}
                query={this.state.query}
                hint={this.getHint(highlightedIndex)}
                isOpen={this.state.isOpen}
                isStalled={this.state.isStalled}
                onInputRef={ref => {
                  this.inputRef = ref as HTMLInputElement;
                }}
                getInputProps={getInputProps}
                onFocus={() => {
                  if (canOpen) {
                    this.setState({
                      isOpen: true,
                    });
                  }

                  if (this.props.minLength === 0 && !this.state.query) {
                    this.performQuery('');
                  }

                  this.props.onFocus({
                    state: this.state,
                    setState: this.setState.bind(this),
                  });
                }}
                onKeyDown={(event: KeyboardEvent) => {
                  const suggestion: any = this.state.results.flat()[
                    Math.max(0, highlightedIndex)
                  ];
                  const source = this.getSourceFromHighlightedIndex(
                    Math.max(0, highlightedIndex)
                  );

                  if (suggestion) {
                    this.props.onKeyDown({
                      event,
                      suggestion,
                      suggestionValue: source.getSuggestionValue({
                        suggestion,
                        state: this.state,
                      }),
                      source,
                      state: this.state,
                      setState: this.setState.bind(this),
                    });
                  }

                  if (event.key === 'Escape') {
                    if (this.state.isOpen) {
                      this.setState({
                        isOpen: false,
                      });
                    } else {
                      this.setState({
                        query: '',
                        isOpen: false,
                      });
                    }
                  } else if (
                    event.key === 'Tab' ||
                    (event.key === 'ArrowRight' &&
                      (event.target! as HTMLInputElement).selectionStart ===
                        this.state.query.length)
                  ) {
                    event.preventDefault();

                    const nextQuery = source.getSuggestionValue({
                      suggestion,
                      state: this.state,
                    });

                    if (this.state.query !== nextQuery) {
                      this.performQuery(nextQuery);

                      setHighlightedIndex(this.props.defaultHighlightedIndex);
                    }
                  }
                }}
                onReset={() => {
                  this.setState({
                    query: '',
                  });
                }}
                onChange={(event: KeyboardEvent) => {
                  this.performQuery((event.target as any).value);
                }}
                onSubmit={(event: Event) => {
                  event.preventDefault();

                  this.inputRef && this.inputRef.blur();

                  this.setState({
                    isOpen: false,
                  });
                }}
              />

              <Dropdown
                hidden={!isOpen}
                isLoading={this.state.isLoading}
                results={this.state.results}
                query={this.state.query}
                internalState={this.state}
                internalSetState={this.setState.bind(this)}
                sources={this.props.sources}
                onClick={this.props.onClick}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
              />
            </div>
          );
        }}
      </Downshift>
    );
  }
}
