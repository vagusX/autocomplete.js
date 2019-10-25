/** @jsx h */

import { h, Component } from 'preact';
import Downshift from 'downshift/preact';

import { AutocompleteSource } from '.';
import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';

export type Result = any;

/**
 * Item used internally.
 */
export type InternalItem = {
  suggestion: unknown;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
  state: AutocompleteState;
  setState(nextState: Partial<AutocompleteState>): void;
};

type AutocompleteOptions = {
  /**
   * The text that appears in the search box input when there is no query.
   */
  placeholder: string;
  /**
   * The number of milliseconds before the search is considered as stalled.
   */
  defaultHighlightedIndex?: number;
  minLength?: number;
  stalledDelay: number;
  keyboardShortcuts?: string[];
  /**
   * The sources to get the suggestions.
   */
  sources: AutocompleteSource[];
  // @TODO: call whenever state.isOpen is true
  // onOpen: () => void;
  // @TODO: call whenever state.isOpen is false
  // onClose: () => void;
  // onHover: (item: InternalItem) => void;
  onFocus: () => void;
  onSelect: ({ item }: { item: InternalItem }) => void;
  onInput?: ({ query }: { query: string }) => void;
  onClick?({ event, item }: { event: MouseEvent; item: InternalItem }): void;
  onKeyDown?({
    event,
    item,
  }: {
    event: KeyboardEvent;
    item: InternalItem;
  }): void;
};

export type AutocompleteState = {
  query: string;
  results: Result[];
  isOpen: boolean;
  isLoading: boolean;
  isStalled: boolean;
};

let autocompleteIdCounter = 0;

/**
 * Generates a unique ID for an instance of a Autocomplete DownShift instance.
 */
function generateId(): string {
  return String(autocompleteIdCounter++);
}

const defaultProps: AutocompleteOptions = {
  placeholder: '',
  minLength: 1,
  defaultHighlightedIndex: 0,
  stalledDelay: 300,
  keyboardShortcuts: [],
  sources: [],
  onSelect: ({ item }) => {
    item.setState({
      isOpen: false,
    });
  },
  onInput: () => {},
  onFocus: () => {},
  onClick: () => {},
  onKeyDown: () => {},
};

export type AutocompleteProps = Required<AutocompleteOptions>;

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
  };

  // @TODO: see how we can use this
  // setInternalState = (newState: Partial<AutocompleteState>) => {
  //   return this.setState(() => newState);
  // };

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
    const resultsSizes = this.state.results.reduce<number[]>((acc, result) => {
      acc.push(result.length + acc.reduce((a, b) => a + b, 0));
      return acc;
    }, []);
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
      this.setState(
        {
          isLoading: false,
          isOpen: false,
          query,
          results: [],
        },
        () => {
          this.props.onInput({ query });
        }
      );

      return;
    }

    this.setState(
      {
        isLoading: true,
        query,
      },
      () => {
        this.props.onInput({ query });
      }
    );

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
          isOpen: false,
        });

        throw error;
      });
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
        itemToString={(item: InternalItem) => {
          return item
            ? item.source.getSuggestionValue(item.suggestion, this.state)
            : '';
        }}
        defaultHighlightedIndex={this.props.defaultHighlightedIndex}
        onSelect={(item: InternalItem) => {
          if (item) {
            const { suggestion, source, state, setState } = item;

            this.performQuery(
              source.getSuggestionValue(suggestion, this.state)
            );

            this.props.onSelect({
              item: {
                suggestion: suggestion,
                suggestionValue: source.getSuggestionValue(
                  suggestion,
                  this.state
                ),
                source,
                state,
                setState,
              },
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
        }) => (
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

                if (this.props.minLength === 0) {
                  this.performQuery('');
                }

                this.props.onFocus();
              }}
              onKeyDown={(event: KeyboardEvent) => {
                const item = this.state.results.flat()[highlightedIndex];
                const source = this.getSourceFromHighlightedIndex(
                  highlightedIndex
                );

                if (item) {
                  this.props.onKeyDown({
                    event,
                    item: {
                      suggestion: item,
                      suggestionValue: source.getSuggestionValue(
                        item,
                        this.state
                      ),
                      source,
                      state: this.state,
                      setState: this.setState.bind(this),
                    },
                  });
                }

                if (event.key === 'Escape') {
                  this.setState(
                    {
                      // @TODO: should the query become empty?
                      query: '',
                      isOpen: false,
                    },
                    () => {
                      this.props.onInput({ query: this.state.query });
                    }
                  );
                } else if (event.key === 'Tab') {
                  event.preventDefault();

                  const source = this.getSourceFromHighlightedIndex(
                    highlightedIndex
                  );

                  const nextQuery = source.getSuggestionValue(item, this.state);

                  if (this.state.query !== nextQuery) {
                    this.performQuery(nextQuery);

                    setHighlightedIndex(0);
                  }
                }
              }}
              onReset={() => {
                this.setState(
                  {
                    query: '',
                  },
                  () => {
                    // this.props.onSelect(undefined);
                    this.props.onInput({ query: this.state.query });
                  }
                );
              }}
              onChange={(event: KeyboardEvent) => {
                this.performQuery((event.target as any).value);
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
        )}
      </Downshift>
    );
  }
}
