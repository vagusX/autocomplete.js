/** @jsx h */

import { h, render } from 'preact';

import { Autocomplete, Result, InternalItem } from './Autocomplete';
import { Template } from './Template';

export type AutocompleteTemplates = {
  empty?: Template;
  suggestion?: Template;
  header?: Template;
  footer?: Template;
};

export interface AutocompleteSource {
  key?: string;
  getSuggestionValue(value: unknown, item: InternalItem): string;
  getSuggestions({ query }: { query: string }): Result[] | Promise<Result[]>;
  templates?: AutocompleteTemplates;
}

/**
 * Item exposed to the lifecycle hooks.
 */
export type AutocompleteItem = {
  suggestion: unknown;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
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
  stalledDelay?: number;
  /**
   * The default item index to pre-select.
   *
   * @default 0
   */
  defaultHighlightedIndex?: number;
  /**
   * The keyboard shortcuts keys to focus the input.
   */
  keyboardShortcuts?: string[];
  /**
   * The minimum number of characters long the autocomplete opens.
   */
  minLength?: number;
  onInput?({ query }: { query: string }): void;
  onSelect?: ({ item }: { item: InternalItem }) => void;
  onClick?({ event, item }: { event: MouseEvent; item: InternalItem }): void;
  onKeyDown?({
    event,
    item,
  }: {
    event: KeyboardEvent;
    item: InternalItem;
  }): void;
}

function autocomplete(
  options: AutocompleteOptions,
  sources: AutocompleteSource[]
) {
  const {
    container,
    placeholder,
    stalledDelay,
    defaultHighlightedIndex,
    keyboardShortcuts,
    minLength,
    onInput,
    onSelect,
    onClick,
    onKeyDown,
  } = options || {};

  const sanitizedSources = sources.map(source => ({
    // @TODO: set `getSuggestionValue` as `() => ''` by default
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
      sources={sanitizedSources}
      onInput={onInput}
      onSelect={onSelect}
      onClick={onClick}
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
