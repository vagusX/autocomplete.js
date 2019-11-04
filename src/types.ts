import { Template } from './Template';

export type Suggestion = any;

export interface Environment {
  [prop: string]: unknown;
  addEventListener: Window['addEventListener'];
  removeEventListener: Window['removeEventListener'];
  setTimeout: Window['setTimeout'];
  document: Window['document'];
}

/**
 * Global Autocomplete templates.
 */
interface AutocompleteTemplates {
  /**
   * The template to display before all sources.
   */
  header?: Template;
  /**
   * The template to display after all sources.
   */
  footer?: Template;
}

interface AutocompleteSourceTemplates {
  /**
   * The template to display before all sources.
   */
  header?: Template;
  /**
   * The template for each suggestion.
   */
  suggestion: Template<{ suggestion: Suggestion }>;
  /**
   * The template to display after all sources.
   */
  footer?: Template;
  /**
   * The template to display when there are no suggestions.
   */
  empty?: Template;
}

export interface AutocompleteSource {
  /**
   * Function called to get the value of the suggestion. The value is used to fill the search box.
   */
  getSuggestionValue({
    suggestion,
    state,
  }: {
    suggestion: Suggestion;
    state: AutocompleteState;
  }): string;
  /**
   * Function called when the input changes. You can use this function to filter/search the items based on the query.
   */
  getSuggestions(options: {
    query: string;
    state: AutocompleteState;
    setState(nextState: Partial<AutocompleteState>): void;
  }): Suggestion[] | Promise<Suggestion[]>;
  /**
   * Templates to use for the source.
   */
  templates: AutocompleteSourceTemplates;
  /**
   * Function called when an item is selected.
   */
  onSelect?: (options: ItemEventHandlerOptions) => void;
  /**
   * Function called when the input changes.
   */
  onInput?: (options: EventHandlerOptions) => void;
}

export interface AutocompleteItem {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
}

export interface EventHandlerOptions {
  state: AutocompleteState;
  setState(nextState: Partial<AutocompleteState>): void;
}

export interface ItemEventHandlerOptions extends EventHandlerOptions {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getSuggestionValue']>;
  source: AutocompleteSource;
}

export interface AutocompleteProps {
  /**
   * The container for the autocomplete search box.
   */
  container: HTMLElement;
  /**
   * The sources to get the suggestions from.
   */
  getSources(options: { query: string }): AutocompleteSource[];
  /**
   * The container for the autocomplete dropdown.
   *
   * @default environment.document.body
   */
  dropdownContainer?: HTMLElement;
  /**
   * The dropdown position related to the container.
   * Possible values are `"left"` and `"right"`.
   *
   * @default "left"
   */
  dropdownPosition?: 'left' | 'right';
  /**
   * The text that appears in the search box input when there is no query.
   */
  placeholder?: string;
  /**
   * Whether to show the highlighted suggestion as completion in the input.
   *
   * @default false
   */
  showCompletion?: boolean;
  /**
   * The minimum number of characters long the autocomplete opens.
   *
   * @default 1
   */
  minLength?: number;
  /**
   * Focus the search box when the page is loaded.
   *
   * @default false
   */
  autofocus?: boolean;
  /**
   * The keyboard shortcuts keys to focus the input.
   */
  keyboardShortcuts?: string[];
  /**
   * The default item index to pre-select.
   *
   * @default 0
   */
  defaultHighlightedIndex?: number;
  /**
   * The number of milliseconds before the autocomplete experience is considered
   * as stalled.
   *
   * @default 300
   */
  stalledDelay?: number;
  /**
   * The initial state to apply when the page is loaded.
   */
  initialState?: Partial<AutocompleteState>;
  templates?: AutocompleteTemplates;
  environment?: Environment;
  onFocus?: (options: EventHandlerOptions) => void;
  onClick?: (event: MouseEvent, options: ItemEventHandlerOptions) => void;
  onKeyDown?: (
    event: KeyboardEvent,
    options: EventHandlerOptions & Partial<ItemEventHandlerOptions>
  ) => void;
  onError?: (options: EventHandlerOptions) => void;
  onEmpty?: (options: EventHandlerOptions) => void;
}

export type RequiredAutocompleteProps = Required<AutocompleteProps>;

export interface AutocompleteState {
  query: string;
  results: Suggestion[][];
  isOpen: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error: Error | null;
  metadata: { [key: string]: any };
}
