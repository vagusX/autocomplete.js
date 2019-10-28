/** @jsx h */

import { h, render } from 'preact';

import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteSource,
} from './Autocomplete';
import { getHTMLElement } from './utils';

export interface Environment {
  [prop: string]: unknown;
  addEventListener: Window['addEventListener'];
  removeEventListener: Window['removeEventListener'];
  setTimeout: Window['setTimeout'];
  document: Window['document'];
}

export interface AutocompleteOptions extends AutocompleteProps {
  /**
   * The input container to insert the search box.
   */
  container: string | HTMLElement;
}

function autocomplete(
  options: AutocompleteOptions,
  sources: Array<AutocompleteSource>
) {
  const {
    container,
    dropdownContainer,
    environment = typeof window === 'undefined' ? ({} as Environment) : window,
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

  const containerElement = getHTMLElement(container);
  const dropdownContainerElement = dropdownContainer
    ? getHTMLElement(dropdownContainer)
    : environment.document.body;

  render(
    <Autocomplete
      dropdownContainer={dropdownContainerElement}
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
      environment={environment}
      onSelect={onSelect}
      onClick={onClick}
      onError={onError}
      onKeyDown={onKeyDown}
    />,
    containerElement,
    containerElement.lastChild as HTMLElement
  );
}

export default autocomplete;
export {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from './utils/highlight';
