/** @jsx h */

import { h, render } from 'preact';
import { storiesOf } from '@storybook/html';

import { createAutocomplete } from '../src/core';
import { withPlayground } from '../.storybook/decorators';

storiesOf('Core', module).add(
  'Default',
  withPlayground(({ container, dropdownContainer }) => {
    const autocomplete = createAutocomplete<{ label: string }>({
      onStateChange({ state }) {
        console.log('onStateChange', state);
      },
      onSelect() {
        console.log('onSelect');
      },
      getSources() {
        return [
          {
            getSuggestions() {
              return [
                { label: 'Orange' },
                { label: 'Apple' },
                { label: 'Banana' },
              ];
            },
          },
        ];
      },
    });

    function Autocomplete({
      autocomplete,
    }: {
      autocomplete: ReturnType<typeof createAutocomplete>;
    }) {
      return (
        <div>
          <input
            type="search"
            {...autocomplete.getInputProps()}
            onInput={event => {
              autocomplete.setQuery(event.currentTarget.value);
            }}
            onKeyDown={event => {
              autocomplete.onKeyDown(event);
            }}
          />
        </div>
      );
    }

    render(<Autocomplete autocomplete={autocomplete} />, container);

    return container;
  })
);
