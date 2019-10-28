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
  sources: Array<AutocompleteSource>;
}

export const defaultEnvironment =
  typeof window === 'undefined' ? ({} as Environment) : window;

function autocomplete(options: AutocompleteOptions) {
  const {
    container,
    dropdownContainer,
    environment = defaultEnvironment,
    placeholder,
    stalledDelay,
    defaultHighlightedIndex,
    keyboardShortcuts,
    minLength,
    showHint,
    autofocus,
    initialState,
    templates,
    sources,
    onSelect,
    onClick,
    onKeyDown,
    onError,
  } = options || {};

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
      sources={sources}
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
