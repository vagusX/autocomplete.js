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
            <div className="algolia-autocomplete-results">
              <Template template={source.templates.header} />

              {!isLoading && suggestions.length === 0 ? (
                <Template
                  data={{ query }}
                  template={source.templates.empty}
                  defaultTemplate={({ query }) => (
                    <div>
                      <p>
                        No results for <q>{query}</q>
                      </p>
                      <p>Try to use different terms.</p>
                    </div>
                  )}
                />
              ) : (
                <Suggestions
                  suggestions={suggestions}
                  source={source}
                  getItemProps={getItemProps}
                  getMenuProps={getMenuProps}
                />
              )}

              <Template template={source.templates.footer} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SuggestionsProps {
  getItemProps: any;
  getMenuProps: any;
  suggestions: Result;
  source: AutocompleteSource;
}

const Suggestions = ({
  getItemProps,
  getMenuProps,
  suggestions,
  source,
}: SuggestionsProps) => {
  return (
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
          <li
            {...getItemProps({
              item: { suggestion, source },
              tabIndex: 0,
            })}
            className="algolia-autocomplete-item"
          >
            <Template
              data={suggestion}
              template={source.templates.suggestion}
              defaultTemplate={suggestion => suggestion}
            />
          </li>
        );
      })}
    </ul>
  );
};
