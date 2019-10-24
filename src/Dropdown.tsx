/** @jsx h */

import { h } from 'preact';

import { AutocompleteSource } from '.';
import { Template } from './Template';
import { Result } from './Autocomplete';

interface DropdownProps {
  isLoading: boolean;
  query: string;
  results: Result[];
  sources: AutocompleteSource[];
  getItemProps(options?: object): any;
  getMenuProps(options?: object): any;
}

export const Dropdown = ({
  isLoading,
  query,
  results,
  sources,
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
                    return (
                      <Template
                        tagName="li"
                        rootProps={{
                          className: 'algolia-autocomplete-item',
                          // tabIndex: 0,
                          ...getItemProps({
                            item: { suggestion, source },
                            tabIndex: 0,
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
