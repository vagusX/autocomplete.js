import { getAccessibilityGetters } from './accessibilityGetters';
import { getAutocompleteSetters } from './autocompleteSetters';
import { getEventHandlers } from './eventHandlers';

import { AutocompleteOptions, AutocompleteState } from './types';

type AutocompleteItem = {
  id: string;
  isActive: boolean;
};

type CreateAutocomplete = <TItem>(
  options: AutocompleteOptions<TItem>
) => AutocompleteState<TItem>;

let autocompleteId = 0;

const generateAutocompleteId = () => {
  return `autocomplete-${autocompleteId++}`;
};

const createAutocomplete: CreateAutocomplete = <
  TItem // extends AutocompleteItem
>({
  id = generateAutocompleteId(),
  // onSelect,
  onStateChange,
  initialState = {
    highlightedIndex: 0,
    query: '',
    isOpen: false,
    status: 'idle',
    statusContext: {},
    context: {},
    suggestions: [],
  },
}) => {
  let state: Partial<AutocompleteState<TItem>> = {
    highlightedIndex: initialState.highlightedIndex,
    query: initialState.query,
    suggestions: initialState.suggestions,
    isOpen: initialState.isOpen,
    status: initialState.status,
    statusContext: initialState.statusContext,
    context: initialState.context,
  };

  const { onKeyDown } = getEventHandlers({ state, onStateChange });
  const {
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
  } = getAutocompleteSetters({ state, onStateChange });
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  } = getAccessibilityGetters(id);

  state = {
    ...state,
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    onKeyDown,
  };

  return state;
};

export { createAutocomplete };
