/** @jsx h */

import { h } from 'preact';

import {
  AutocompleteItem,
  AutocompleteState,
  RequiredAutocompleteProps,
} from './Autocomplete';
import { Template } from './Template';

interface DropdownProps {
  hidden: boolean;
  templates: RequiredAutocompleteProps['templates'];
  sources: ReturnType<RequiredAutocompleteProps['getSources']>;
  onClick: RequiredAutocompleteProps['onClick'];
  internalState: AutocompleteState;
  internalSetState(nextState: Partial<AutocompleteState>): void;
  getItemProps(options?: object): any;
  getMenuProps(options?: object): any;
}

export const Dropdown = ({
  hidden,
  sources,
  templates,
  internalState,
  internalSetState,
  onClick,
  getItemProps,
  getMenuProps,
}: DropdownProps) => {
  return (
    <div className="algolia-autocomplete-dropdown" hidden={hidden}>
      <Template
        tagName="header"
        data={{
          state: internalState,
          setState: internalSetState,
        }}
        template={templates.header}
        rootProps={{
          className: 'algolia-autocomplete-header',
        }}
      />

      <div className="algolia-autocomplete-dropdown-container">
        {internalState.results.map((suggestions, index) => {
          const source = sources[index];

          return (
            <section className="algolia-autocomplete-results">
              <Template
                tagName="header"
                data={{
                  state: internalState,
                  setState: internalSetState,
                }}
                template={source.templates.header}
              />

              {!internalState.isLoading && suggestions.length === 0 ? (
                <Template
                  data={{
                    state: internalState,
                    setState: internalSetState,
                  }}
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
                              onClick(event, {
                                suggestion: item.suggestion,
                                suggestionValue: item.suggestionValue,
                                source: item.source,
                                state: internalState,
                                setState: internalSetState,
                              }),
                          }),
                        }}
                        data={{
                          suggestion,
                          state: internalState,
                          setState: internalSetState,
                        }}
                        template={source.templates.suggestion}
                      />
                    );
                  })}
                </ul>
              )}

              <Template
                tagName="footer"
                data={{
                  state: internalState,
                  setState: internalSetState,
                }}
                template={source.templates.footer}
              />
            </section>
          );
        })}

        <Template
          tagName="footer"
          data={{
            state: internalState,
            setState: internalSetState,
          }}
          template={templates.footer}
          rootProps={{
            className: 'algolia-autocomplete-footer',
          }}
        />
      </div>
    </div>
  );
};
