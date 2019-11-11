/** @jsx h */

import { h, render, createRef } from 'preact';

import { Autocomplete, defaultEnvironment } from './Autocomplete';
import { getHTMLElement } from './utils';
import { AutocompleteOptions, AutocompleteApi } from './types';

function autocomplete(options: AutocompleteOptions): AutocompleteApi {
  const {
    autofocus,
    container,
    defaultHighlightedIndex,
    dropdownContainer,
    dropdownPosition,
    environment = defaultEnvironment,
    getSources,
    initialState,
    keyboardShortcuts,
    minLength,
    onClick,
    onError,
    onFocus,
    onInput,
    onKeyDown,
    placeholder,
    showCompletion,
    stallThreshold,
    templates,
    transformResultsRender,
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
