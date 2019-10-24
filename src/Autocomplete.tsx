/** @jsx h */

import { h, Component } from 'preact';
import Downshift from 'downshift/preact';

import { AutocompleteSource, AutocompleteItem } from '.';
import { Dropdown } from './Dropdown';
import { SearchBox } from './SearchBox';

export type Result = any;

/**
 * Item used internally.
 */
type InternalItem = {
  suggestion: unknown;
  source: AutocompleteSource;
};

type AutocompleteProps = {
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
  onOpen: () => void;
  // @TODO: call whenever state.isOpen is false
  onClose: () => void;
  onFocus: () => void;
  onSelect: (item: AutocompleteItem) => void;
  onHover: (item: AutocompleteItem) => void;
  onInput?: ({ query }: { query: string }) => void;
};

type AutocompleteState = {
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

const defaultProps: Partial<AutocompleteProps> = {
  placeholder: '',
  minLength: 1,
  defaultHighlightedIndex: 0,
  stalledDelay: 300,
  keyboardShortcuts: [],
  onHover: ({ suggestion, suggestionValue }) => {
    console.log('onHover', { suggestion, suggestionValue });
  },
  onSelect: ({ suggestion, suggestionValue }) => {
    console.log('onItemSelect', { suggestion, suggestionValue });
  },
  onInput: () => {},
  onFocus: () => {},
};

export class Autocomplete extends Component<
  AutocompleteProps,
  AutocompleteState
> {
  static defaultProps = defaultProps;
  setIsStalledId: number | null = null;
  inputRef = null;

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
          return item ? item.source.getSuggestionValue(item.suggestion) : '';
        }}
        defaultHighlightedIndex={this.props.defaultHighlightedIndex}
        // onStateChange={(changes: {
        //   highlightedIndex?: number;
        //   inputValue: string;
        //   isOpen: boolean;
        //   selectedItem?: DownshiftItem;
        // }) => {
        //   if (changes.highlightedIndex === undefined) {
        //     return;
        //   }

        //   // const highlightedItem = this.state.results[changes.highlightedIndex];

        //   // @TODO: move `onHover` hook somewhere else
        //   // const { suggestion, source } = changes.selectedItem;
        //   // this.props.onHover({
        //   //   suggestion,
        //   //   suggestionValue: source.getSuggestionValue(suggestion),
        //   // });
        // }}
        onSelect={(item: InternalItem) => {
          this.setState({
            isOpen: false,
          });

          if (item) {
            const { suggestion, source } = item;

            this.props.onSelect({
              suggestion: suggestion,
              suggestionValue: source.getSuggestionValue(suggestion),
            });
          }
        }}
        onChange={(item: InternalItem) => {
          if (!item) {
            return;
          }

          this.setState({
            query: item.source.getSuggestionValue(item.suggestion),
          });
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
        {({ highlightedIndex, getInputProps, getItemProps, getMenuProps }) => (
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
                this.inputRef = ref;
              }}
              getInputProps={getInputProps}
              onFocus={() => {
                if (canOpen) {
                  this.setState({
                    isOpen: true,
                  });
                }

                this.props.onFocus();
              }}
              onKeyDown={(event: KeyboardEvent) => {
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
                  // this.setState({
                  //   query: this.state.results[highlightedIndex],
                  // });
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
                if (this.setIsStalledId) {
                  clearTimeout(this.setIsStalledId);
                  this.setState({
                    isStalled: false,
                  });
                }

                const query = (event.target as any).value;

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
              }}
            />

            {isOpen && (
              <Dropdown
                isLoading={this.state.isLoading}
                results={this.state.results}
                query={this.state.query}
                sources={this.props.sources}
                getMenuProps={getMenuProps}
                getItemProps={getItemProps}
              />
            )}
          </div>
        )}
      </Downshift>
    );
  }
}
