/** @jsx h */

import { h, render } from 'preact';

import {
  Autocomplete,
  AutocompleteProps,
  defaultEnvironment,
} from './Autocomplete';
import { getHTMLElement } from './utils';

interface AutocompleteOptions extends AutocompleteProps {
  /**
   * The input container to insert the search box.
   */
  container: string | HTMLElement;
}

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
    getSources,
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
      getSources={getSources}
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
