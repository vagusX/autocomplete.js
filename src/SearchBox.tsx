/** @jsx h */

import { h, Ref } from 'preact';

import {
  AutocompleteState,
  RequiredAutocompleteProps,
  SetState,
} from './types';

export interface SearchBoxProps {
  placeholder: RequiredAutocompleteProps['placeholder'];
  autofocus: RequiredAutocompleteProps['autofocus'];
  completion: string;
  internalState: AutocompleteState;
  internalSetState: SetState;
  onInput: (event: any) => void;
  onFocus: RequiredAutocompleteProps['onFocus'];
  onKeyDown: (event: KeyboardEvent) => void;
  onReset: (event: MouseEvent) => void;
  onSubmit: (event: Event) => void;
  onInputRef: Ref<HTMLInputElement | null>;
  getInputProps(options?: object): any;
}

export function SearchBox(props: SearchBoxProps) {
  const showCompletion = Boolean(
    props.internalState.isOpen &&
      !props.internalState.isStalled &&
      props.completion
  );

  return (
    <form
      action=""
      role="search"
      noValidate
      className="algolia-autocomplete-form"
      onSubmit={props.onSubmit}
    >
      <label
        for={props.getInputProps().id}
        className="algolia-autocomplete-magnifierLabel"
      >
        <svg viewBox="0 0 18 18">
          <path
            d="M13.14 13.14L17 17l-3.86-3.86A7.11 7.11 0 1 1 3.08 3.08a7.11 7.11 0 0 1 10.06 10.06z"
            stroke="currentColor"
            stroke-width="1.78"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </label>

      <div className="algolia-autocomplete-loadingIndicator">
        <svg viewBox="0 0 38 38" stroke="currentColor" stroke-opacity=".5">
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)" stroke-width="2">
              <circle stroke-opacity=".3" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                {/*
                // @ts-ignore */}
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </div>

      <div className="algolia-autocomplete-searchbox">
        {showCompletion && (
          <span
            className="algolia-autocomplete-completion"
            aria-live={'assertive'}
            aria-suggest={`Press tab to select ${props.completion}`}
          >
            {props.completion}
          </span>
        )}

        <input
          className="algolia-autocomplete-input"
          {...props.getInputProps({
            placeholder: showCompletion ? '' : props.placeholder,
            ref: props.onInputRef,
            autofocus: props.autofocus,
            type: 'search',
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: 'false',
            maxLength: '512',
            value: props.internalState.query,
            onInput: props.onInput,
            onKeyDown: props.onKeyDown,
            onFocus: props.onFocus,
            // When the dropdown is closed and you click on the input while
            // the input is focused, the `onFocus` event is not triggered.
            // We mimic this event by catching the `onClick` event which
            // triggers the `onFocus` for the dropdown to open.
            onClick: () => {
              if (!props.internalState.isOpen) {
                props.onFocus({
                  state: props.internalState,
                  setState: props.internalSetState,
                });
              }
            },
          })}
        />
      </div>

      <button
        type="reset"
        title="Clear the query"
        className="algolia-autocomplete-reset"
        hidden={props.internalState.query.length === 0}
        onClick={props.onReset}
      >
        <svg viewBox="0 0 10 10">
          <path
            d="M5 4.12L8.93.18a.62.62 0 1 1 .89.89L5.88 5l3.94 3.93a.62.62 0 1 1-.89.89L5 5.88 1.07 9.82a.62.62 0 1 1-.89-.89L4.12 5 .18 1.07a.62.62 0 1 1 .89-.89L5 4.12z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        </svg>
      </button>
    </form>
  );
}
