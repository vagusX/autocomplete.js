/** @jsx h */

import { h } from 'preact';

import { AutocompleteSource } from '.';
import { Template } from './Template';
import {
  Result,
  AutocompleteState,
  InternalItem,
  AutocompleteProps,
} from './Autocomplete';

interface DropdownProps {
  isLoading: boolean;
  query: string;
  results: Result[];
  sources: AutocompleteSource[];
  internalState: AutocompleteState;
  internalSetState(nextState: Partial<AutocompleteState>): void;
  onClick: AutocompleteProps['onClick'];
  getItemProps(options?: object): any;
  getMenuProps(options?: object): any;
}

export const Dropdown = ({
  isLoading,
  query,
  results,
  sources,
  internalState,
  internalSetState,
  onClick,
  getItemProps,
  getMenuProps,
}: DropdownProps) => {
  return (
    <div className="algolia-autocomplete-dropdown">
      <div className="algolia-autocomplete-dropdown-container">
        {results.map((suggestions, index) => {
          const source = sources[index];

          return (
            <section className="algolia-autocomplete-results">
              <Template tagName="header" template={source.templates.header} />

              {!isLoading && suggestions.length === 0 ? (
                <Template data={{ query }} template={source.templates.empty} />
              ) : (
                <ul
                  {...getMenuProps(
                    {},
                    // @TODO: remove `suppressRefError`
                    // See https://github.com/downshift-js/downshift#getmenuprops
                    { suppressRefError: true }
                  )}
                >
                  {suggestions.map(suggestion => {
                    const item: InternalItem = {
                      suggestionValue: source.getSuggestionValue(suggestion, {
                        item: {},
                        suggestion,
                        source,
                        state: internalState,
                        setState: internalSetState,
                      }),
                      suggestion,
                      source,
                      state: internalState,
                      setState: internalSetState,
                    };

                    return (
                      <Template
                        tagName="li"
                        rootProps={{
                          className: 'algolia-autocomplete-item',
                          // tabIndex: 0,
                          ...getItemProps({
                            item,
                            tabIndex: 0,
                            onClick: (event: MouseEvent) =>
                              onClick({ event, item }),
                          }),
                        }}
                        data={suggestion}
                        template={source.templates.suggestion}
                        defaultTemplate={suggestion => suggestion}
                      />
                    );
                  })}
                </ul>
              )}

              <Template tagName="footer" template={source.templates.footer} />
            </section>
          );
        })}
      </div>
    </div>
  );
};
