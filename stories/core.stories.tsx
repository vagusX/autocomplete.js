/** @jsx h */

import { h, render } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { storiesOf } from '@storybook/html';

import { withPlayground } from '../.storybook/decorators';
import { createAutocomplete } from '../src/core';
import { SearchBox } from '../src/react-renderer/SearchBox';
import { Dropdown } from '../src/react-renderer/Dropdown';

import { AutocompleteState } from '../src/core/types';

type Item = {
  label: string;
};

storiesOf('Core', module).add(
  'Default',
  withPlayground(({ container, dropdownContainer }) => {
    function Autocomplete({ placeholder = '', autoFocus = false }) {
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
          onStateChange({ state }) {
            console.log('onStateChange', state);
            setState(state);
          },
          getSources() {
            return [
              {
                getSuggestions({ query }) {
                  return [
                    { label: 'Orange' },
                    { label: 'Apple' },
                    { label: 'Banana' },
                  ].filter(item =>
                    item.label.toLowerCase().includes(query.toLowerCase())
                  );
                },
              },
            ];
          },
        })
      );

      return (
        <div>
          <SearchBox
            placeholder={placeholder}
            autoFocus={autoFocus}
            completion=""
            query={state.query}
            isOpen={state.isOpen}
            status={state.status}
            getInputProps={autocomplete.current.getInputProps}
            onKeyDown={autocomplete.current.onKeyDown}
            onInput={autocomplete.current.onInput}
            onFocus={() => {}}
            onReset={() => {}}
            onSubmit={() => {}}
          />

          <Dropdown
            suggestions={state.suggestions}
            status={status}
            getItemProps={autocomplete.current.getItemProps}
            getMenuProps={autocomplete.current.getMenuProps}
          />
        </div>
      );
    }

    render(<Autocomplete placeholder="Search items" />, container);

    return container;
  })
);
