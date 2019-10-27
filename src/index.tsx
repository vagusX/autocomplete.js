/** @jsx h */

import { h, render } from 'preact';

import {
  Autocomplete,
  OptionalAutocompleteOptions,
  AutocompleteSource,
} from './Autocomplete';

export interface AutocompleteOptions extends OptionalAutocompleteOptions {
  /**
   * The input container to insert the search box.
   */
  container: HTMLElement;
}

function autocomplete(
  options: AutocompleteOptions,
  sources: Array<AutocompleteSource>
) {
  const {
    container,
    placeholder,
    stalledDelay,
    defaultHighlightedIndex,
    keyboardShortcuts,
    minLength,
    showHint,
    autofocus,
    initialState,
    templates,
    onSelect,
    onClick,
    onKeyDown,
    onError,
  } = options || {};

  const sanitizedSources = sources.map(source => ({
    // @TODO: set `getSuggestionValue` as `() => ''` by default?
    templates: {},
    ...source,
  }));

  render(
    // @ts-ignore @TODO: fix refs error
    <Autocomplete
      placeholder={placeholder}
      stalledDelay={stalledDelay}
      defaultHighlightedIndex={defaultHighlightedIndex}
      keyboardShortcuts={keyboardShortcuts}
      minLength={minLength}
      autofocus={autofocus}
      showHint={showHint}
      initialState={initialState}
      sources={sanitizedSources}
      templates={templates}
      onSelect={onSelect}
      onClick={onClick}
      onError={onError}
      onKeyDown={onKeyDown}
    />,
    container,
    container.lastChild as Element
  );
}

export default autocomplete;
export {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from './utils/highlight';
