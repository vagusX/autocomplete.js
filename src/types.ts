import { Template } from './Template';
import { StateUpdater } from 'preact/hooks';

export type Suggestion = any;

export interface Result {
  source: AutocompleteSource;
  suggestions: Suggestion[];
}

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

export interface AutocompleteState {
  query: string;
  results: Result[];
  isOpen: boolean;
  isLoading: boolean;
  isStalled: boolean;
  error: Error | null;
  context: { [key: string]: any };
}

interface SuggestionsOptions extends AutocompleteSetters {
  query: string;
  state: AutocompleteState;
}

export interface AutocompleteSource {
  /**
   * Function called to get the value of the suggestion. The value is used to fill the search box.
   */
  getInputValue({
    suggestion,
    state,
  }: {
    suggestion: Suggestion;
    state: AutocompleteState;
  }): string;
  /**
   * Function called when the input changes. You can use this function to filter/search the items based on the query.
   */
  getSuggestions(
    options: SuggestionsOptions
  ): Suggestion[] | Promise<Suggestion[]>;
  /**
   * Templates to use for the source.
   */
  templates: AutocompleteSourceTemplates;
  /**
   * Called when an item is selected.
   */
  onSelect?: (options: ItemEventHandlerOptions) => void;
}

export interface AutocompleteItem {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getInputValue']>;
  source: AutocompleteSource;
}

export interface EventHandlerOptions extends AutocompleteSetters {
  state: AutocompleteState;
}

export interface ItemEventHandlerOptions extends EventHandlerOptions {
  suggestion: Suggestion;
  suggestionValue: ReturnType<AutocompleteSource['getInputValue']>;
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
  getSources?(
    options: SuggestionsOptions
  ): AutocompleteSource[] | Promise<AutocompleteSource[]>;
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
   * Whether to focus the search box when the page is loaded.
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
   * The number of milliseconds that must elapse before the autocomplete
   * experience is stalled.
   *
   * @default 300
   */
  stallThreshold?: number;
  /**
   * The initial state to apply when the page is loaded.
   */
  initialState?: Partial<AutocompleteState>;
  /**
   *
   */
  templates?: AutocompleteTemplates;
  /**
   * Called before rendering the results.
   * Useful to wrap results in containers to organize the display.
   */
  transformResultsRender?(results: JSX.Element[]): JSX.Element | JSX.Element[];
  /**
   * The environment from where your JavaScript is running.
   * Useful if you're using Autocomplete.js in a different context than
   * `window`.
   *
   * @default window
   */
  environment?: Environment;
  /**
   * Whether the autocomplete experience is controlled.
   *
   * @default false
   */
  isControlled?: boolean;
  /**
   * The state to inject in Autocomplete.js.
   * If this option is provided, Autocomplete.js is in controlled mode and
   * you're responsible for updating the query and the results.
   */
  state?: Pick<AutocompleteState, 'query' | 'results'>;
  /**
   * Called when the input is focused.
   */
  onFocus?: (options: EventHandlerOptions) => void;
  /**
   * Called when a `click` event is fired on an item.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
   */
  onClick?: (event: MouseEvent, options: ItemEventHandlerOptions) => void;
  /**
   * Called when a `keydown` event is fired.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
   */
  onKeyDown?: (
    event: KeyboardEvent,
    options: EventHandlerOptions & Partial<ItemEventHandlerOptions>
  ) => void;
  /**
   * Called when an error is thrown while getting the suggestions.
   */
  onError?: (options: EventHandlerOptions) => void;
  /**
   * Called when there are no results.
   */
  onEmpty?: (options: EventHandlerOptions) => void;
  /**
   * Called when the input changes.
   */
  onInput?: (options: EventHandlerOptions & { query: string }) => void;
}

export type RequiredAutocompleteProps = Required<AutocompleteProps>;

export interface AutocompleteSetters {
  setQuery: StateUpdater<AutocompleteState['query']>;
  setResults: StateUpdater<AutocompleteState['results']>;
  setIsOpen: StateUpdater<AutocompleteState['isOpen']>;
  setIsLoading: StateUpdater<AutocompleteState['isLoading']>;
  setIsStalled: StateUpdater<AutocompleteState['isStalled']>;
  setError: StateUpdater<AutocompleteState['error']>;
  setContext: StateUpdater<AutocompleteState['context']>;
}

export interface AutocompleteApi extends AutocompleteSetters {}
