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
                <Template data={{ query }} template={source.templates.empty} />
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
  );
};
