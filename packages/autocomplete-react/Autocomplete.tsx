/** @jsx h */

import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { createAutocomplete } from '../autocomplete-core';
import { getDefaultProps } from '../autocomplete-core/defaultProps';
import {
  AutocompleteState,
  AutocompleteOptions,
} from '../autocomplete-core/types';
import { SearchBox } from './SearchBox';
import { Dropdown } from './Dropdown';

export function Autocomplete<TItem extends {}>(
  props: AutocompleteOptions<TItem>
) {
  const { initialState } = getDefaultProps(props);
  const [state, setState] = useState<AutocompleteState<TItem>>(initialState);

  const autocomplete = useRef(
    createAutocomplete<TItem>({
      ...props,
      onStateChange({ state }) {
        setState(state as any);

        if (props.onStateChange) {
          props.onStateChange({ state });
        }
      },
    })
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={[
        'algolia-autocomplete',
        state.status === 'stalled' && 'algolia-autocomplete--stalled',
        state.status === 'error' && 'algolia-autocomplete--errored',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SearchBox
        onInputRef={inputRef}
        completion=""
        query={state.query}
        isOpen={state.isOpen}
        status={state.status}
        getInputProps={autocomplete.current.getInputProps}
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
