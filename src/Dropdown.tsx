/** @jsx h */

import { h } from 'preact';

import { Template } from './Template';
import {
  AutocompleteItem,
  AutocompleteState,
  RequiredAutocompleteProps,
  SetState,
} from './types';

interface DropdownProps extends AutocompleteState {
  position: Pick<ClientRect, 'left' | 'top'> | undefined;
  hidden: boolean;
  templates: RequiredAutocompleteProps['templates'];
  onClick: RequiredAutocompleteProps['onClick'];
  internalSetState: SetState;
  getItemProps(options?: object): any;
  getMenuProps(options?: object): any;
}

export const Dropdown = ({
  position,
  hidden,
  templates,
  isOpen,
  isStalled,
  isLoading,
  query,
  error,
  metadata,
  results,
  internalSetState,
  onClick,
  getItemProps,
  getMenuProps,
}: DropdownProps) => {
  const state = {
    isOpen,
    isStalled,
    isLoading,
    query,
    error,
    metadata,
    results,
  };

  return (
    <div
      className="algolia-autocomplete-dropdown"
      style={position}
      hidden={hidden}
    >
      <Template
        tagName="header"
        data={{
          state,
          setState: internalSetState,
        }}
        template={templates.header}
        rootProps={{
          className: 'algolia-autocomplete-header',
        }}
      />

      <div className="algolia-autocomplete-dropdown-container">
        {results.map(result => {
          const { source, suggestions } = result;

          return (
            <section className="algolia-autocomplete-results">
              <Template
                tagName="header"
                data={{
                  state,
                  setState: internalSetState,
                }}
                template={source.templates.header}
              />

              {!isLoading && suggestions.length === 0 ? (
                <Template
                  data={{
                    state,
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
                        state,
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
                                state,
                                setState: internalSetState,
                              }),
                          }),
                        }}
                        data={{
                          suggestion,
                          state,
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
                  state,
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
            state,
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
