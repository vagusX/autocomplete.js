/** @jsx h */

import { h, render } from 'preact';

import { Autocomplete, AutocompleteProps } from './Autocomplete';
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
    showCompletion,
    autofocus,
    initialState,
    templates,
    sources,
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
      showCompletion={showCompletion}
      initialState={initialState}
      sources={sources}
      templates={templates}
      environment={environment}
      onClick={onClick}
      onError={onError}
      onKeyDown={onKeyDown}
    />,
    containerElement,
    containerElement.lastChild as HTMLElement
  );
}

export default autocomplete;
export { version } from './version';
export { getAlgoliaHits, getAlgoliaResults } from './suggestions';
export {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from './utils/highlight';
