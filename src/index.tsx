/** @jsx h */

import { h, render } from 'preact';

import { Autocomplete, Result } from './Autocomplete';
import { Template } from './Template';

export type AutocompleteTemplates = {
  empty?: Template;
  suggestion?: Template;
  header?: Template;
  footer?: Template;
};

export interface AutocompleteOptions {
  /**
   * The input container to insert the search box.
   */
  container: HTMLElement;
  /**
   * The text that appears in the search box input when there is no query.
   */
  placeholder?: string;
  /**
   * The number of milliseconds before the autocomplete is considered as
   * stalled.
   *
   * @default 300
   */
  stalledSearchDelay?: number;
  /**
   * The default item index to pre-select.
   *
   * @default 0
   */
  defaultHighlightedIndex?: number;
  /**
   * Shortcuts to focus the input.
   */
  keyboardShortcuts?: string[];
  minLength?: number;
}

export interface AutocompleteSource {
  getSuggestionValue?(value: unknown): string;
  getSuggestions({ query }: { query: string }): Promise<Result[]>;
  templates?: AutocompleteTemplates;
}

function autocomplete(
  options: AutocompleteOptions,
  sources: AutocompleteSource[]
) {
  const {
    container,
    placeholder,
    stalledSearchDelay,
    defaultHighlightedIndex,
    keyboardShortcuts,
    minLength,
  } = options || {};

  const sanitizedSources = sources.map(source => ({
    getSuggestionValue: (suggestion: unknown) => suggestion as string,
    templates: {},
    ...source,
  }));

  render(
    <Autocomplete
      placeholder={placeholder}
      stalledSearchDelay={stalledSearchDelay}
      defaultHighlightedIndex={defaultHighlightedIndex}
      keyboardShortcuts={keyboardShortcuts}
      minLength={minLength}
      sources={sanitizedSources}
    />,
    container,
    container.lastChild as Element
  );
}

export default autocomplete;
