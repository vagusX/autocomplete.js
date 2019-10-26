/** @jsx h */

import { h } from 'preact';

import {
  AutocompleteItem,
  AutocompleteSource,
  AutocompleteProps,
  AutocompleteState,
  Suggestion,
} from './Autocomplete';
import { Template } from './Template';

interface DropdownProps {
  hidden: boolean;
  isLoading: boolean;
  query: string;
  results: Array<Suggestion[]>;
  sources: AutocompleteSource[];
  internalState: AutocompleteState;
  internalSetState(nextState: Partial<AutocompleteState>): void;
  onClick: AutocompleteProps['onClick'];
  getItemProps(options?: object): any;
  getMenuProps(options?: object): any;
}

export const Dropdown = ({
  hidden,
  isLoading,
  results,
  sources,
  internalState,
  internalSetState,
  onClick,
  getItemProps,
  getMenuProps,
}: DropdownProps) => {
  return (
    <div className="algolia-autocomplete-dropdown" hidden={hidden}>
      <div className="algolia-autocomplete-dropdown-container">
        {results.map((suggestions, index) => {
          const source = sources[index];

          return (
            <section className="algolia-autocomplete-results">
              <Template
                tagName="header"
                data={{ state: internalState }}
                template={source.templates.header}
              />

              {!isLoading && suggestions.length === 0 ? (
                <Template
                  data={{ state: internalState }}
                  template={source.templates.empty}
                />
              ) : (
                <ul
                  {...getMenuProps(
                    {},
                    // @TODO: remove `suppressRefError`
                    // @ts-ignore
                    // See https://github.com/downshift-js/downshift#getmenuprops
                    { suppressRefError: true }
                  )}
                >
                  {suggestions.map(suggestion => {
                    const item: AutocompleteItem = {
                      suggestionValue: source.getSuggestionValue({
                        suggestion,
                        state: internalState,
                      }),
                      suggestion,
                      source,
                    };

                    return (
                      <Template
                        tagName="li"
                        rootProps={{
                          className: 'algolia-autocomplete-item',
                          ...getItemProps({
                            item,
                            tabIndex: 0,
                            onClick: (event: MouseEvent) =>
                              onClick({
                                event,
                                suggestion: item.suggestion,
                                suggestionValue: item.suggestionValue,
                                source: item.source,
                                state: internalState,
                                setState: internalSetState,
                              }),
                          }),
                        }}
                        data={{ state: internalState, suggestion }}
                        template={source.templates.suggestion}
                      />
                    );
                  })}
                </ul>
              )}

              <Template
                tagName="footer"
                data={{ state: internalState }}
                template={source.templates.footer}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
};
