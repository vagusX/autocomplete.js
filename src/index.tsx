/** @jsx h */

import { h, render } from 'preact';

import { Autocomplete, defaultEnvironment } from './Autocomplete';
import { AutocompleteProps } from './types';
import { getHTMLElement } from './utils';

interface AutocompleteOptions
  extends Omit<AutocompleteProps, 'container' | 'dropdownContainer'> {
  /**
   * The container for the autocomplete search box.
   */
  container: string | HTMLElement;
  /**
   * The container for the autocomplete dropdown.
   *
   * @default environment.document.body
   */
  dropdownContainer?: string | HTMLElement;
}

function autocomplete(options: AutocompleteOptions) {
  const {
    container,
    dropdownContainer,
    dropdownPosition,
    environment = defaultEnvironment,
    placeholder,
    stallThreshold,
    defaultHighlightedIndex,
    keyboardShortcuts,
    minLength,
    showCompletion,
    autofocus,
    initialState,
    templates,
    getSources,
    onInput,
    onClick,
    onKeyDown,
    onError,
    onEmpty,
  } = options || {};

  const containerElement = getHTMLElement(container);
  const dropdownContainerElement = dropdownContainer
    ? getHTMLElement(dropdownContainer)
    : environment.document.body;

  render(
    <Autocomplete
      container={containerElement}
      dropdownContainer={dropdownContainerElement}
      dropdownPosition={dropdownPosition}
      placeholder={placeholder}
      stallThreshold={stallThreshold}
      defaultHighlightedIndex={defaultHighlightedIndex}
      keyboardShortcuts={keyboardShortcuts}
      minLength={minLength}
      autofocus={autofocus}
      showCompletion={showCompletion}
      initialState={initialState}
      getSources={getSources}
      templates={templates}
      environment={environment}
      onInput={onInput}
      onClick={onClick}
      onError={onError}
      onEmpty={onEmpty}
      onKeyDown={onKeyDown}
    />,
    containerElement
  );
}

export default autocomplete;
export { version } from './version';
export { getAlgoliaHits, getAlgoliaResults } from './suggestions';
export {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from './utils/highlight';
