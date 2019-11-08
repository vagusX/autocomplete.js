/** @jsx h */

import { h, render, createRef } from 'preact';

import { Autocomplete, defaultEnvironment } from './Autocomplete';
import { getHTMLElement } from './utils';
import { AutocompleteProps, AutocompleteApi } from './types';

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

function autocomplete(options: AutocompleteOptions): AutocompleteApi {
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
    transformResultsRender,
    getSources,
    onInput,
    onFocus,
    onClick,
    onKeyDown,
    onError,
  } = options || {};

  const autocompleteRef = createRef();

  const containerElement = getHTMLElement(container);
  const dropdownContainerElement = dropdownContainer
    ? getHTMLElement(dropdownContainer)
    : environment.document.body;

  render(
    <Autocomplete
      ref={autocompleteRef}
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
      transformResultsRender={transformResultsRender}
      environment={environment}
      onInput={onInput}
      onFocus={onFocus}
      onClick={onClick}
      onError={onError}
      onKeyDown={onKeyDown}
    />,
    containerElement
  );

  return autocompleteRef.current;
}

export default autocomplete;
export { version } from './version';
export { getAlgoliaHits, getAlgoliaResults } from './suggestions';
export {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
  snippetAlgoliaHit,
} from './utils/highlight';
