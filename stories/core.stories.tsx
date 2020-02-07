/** @jsx h */

import { h, render } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { storiesOf } from '@storybook/html';
import algoliasearch from 'algoliasearch/lite';

import { withPlayground } from '../.storybook/decorators';
import { createAutocomplete } from '../src/core';

import { SearchBox } from '../src/react-renderer/SearchBox';
import { Dropdown } from '../src/react-renderer/Dropdown';
import { getAlgoliaHits } from '../src/suggestions/algolia';

import { AutocompleteState } from '../src/core/types';

type Item = {
  label: string;
};

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

storiesOf('Core', module).add(
  'Default',
  withPlayground(({ container, dropdownContainer }) => {
    function Autocomplete() {
      const [state, setState] = useState<AutocompleteState<Item>>({
        highlightedIndex: 0,
        query: '',
        isOpen: false,
        status: 'idle',
        suggestions: [],
        statusContext: {},
        context: {},
      });

      const autocomplete = useRef(
        createAutocomplete<Item>({
          placeholder: 'Search items…',
          onStateChange({ state }) {
            // console.log('onStateChange', state);
            setState(state);
          },
          getSources() {
            return [
              {
                getInputValue({ suggestion }) {
                  return suggestion.query;
                },
                getSuggestions({ query }) {
                  return getAlgoliaHits({
                    searchClient,
                    queries: [
                      {
                        indexName: 'instant_search_demo_query_suggestions',
                        query,
                        params: {
                          hitsPerPage: 4,
                        },
                      },
                    ],
                  });
                },
              },
            ];
          },
        })
      );

      const inputRef = useRef<HTMLInputElement | null>(null);

      return (
        <div>
          <SearchBox
            onInputRef={inputRef}
            completion=""
            query={state.query}
            isOpen={state.isOpen}
            status={state.status}
            getInputProps={autocomplete.current.getInputProps}
            onInput={autocomplete.current.onInput}
            onFocus={autocomplete.current.onFocus}
            onReset={() => {
              autocomplete.current.onReset();

              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            onSubmit={() => {}}
          />

          <Dropdown
            suggestions={state.suggestions}
            isOpen={state.isOpen}
            status={status}
            getItemProps={autocomplete.current.getItemProps}
            getMenuProps={autocomplete.current.getMenuProps}
          />
        </div>
      );
    }

    render(<Autocomplete />, container);

    return container;
  })
);
