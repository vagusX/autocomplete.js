import { createStore } from './store';
import { getPropGetters } from './propGetters';
import { getAutocompleteSetters } from './autocompleteSetters';
import { getEventHandlers } from './eventHandlers';
import { getItemsCount, normalizeGetSources } from './utils';

import {
  AutocompleteOptions,
  AutocompleteState,
  AutocompleteInstance,
  RequiredAutocompleteOptions,
} from './types';

let autocompleteId = 0;

function generateAutocompleteId() {
  return `autocomplete-${autocompleteId++}`;
}

function getDefaultProps<TItem>(
  props: AutocompleteOptions<TItem>
): RequiredAutocompleteOptions<TItem> {
  const environment: typeof window = (typeof window !== 'undefined'
    ? window
    : {}) as typeof window;

  return {
    id: generateAutocompleteId(),
    minLength: 1,
    placeholder: '',
    showCompletion: false,
    stallThreshold: 300,
    environment,
    shouldDropdownOpen: ({ state }) => getItemsCount(state) > 0,
    ...props,
    // The following props need to be deeply defaulted.
    initialState: {
      highlightedIndex: 0,
      query: '',
      suggestions: [],
      isOpen: false,
      status: 'idle',
      statusContext: {},
      context: {},
      ...props.initialState,
    },
    getSources: normalizeGetSources(props.getSources),
    navigator: {
      navigate({ suggestionUrl }) {
        environment.location.assign(suggestionUrl);
      },
      navigateNewTab({ suggestionUrl }) {
        const windowReference = environment.open(
          suggestionUrl,
          '_blank',
          'noopener'
        );

        if (windowReference) {
          windowReference.focus();
        }
      },
      navigateNewWindow({ suggestionUrl }) {
        environment.open(suggestionUrl, '_blank', 'noopener');
      },
      ...props.navigator,
    },
  };
}

function createAutocomplete<TItem extends {}>(
  options: AutocompleteOptions<TItem>
): AutocompleteInstance<TItem> {
  const props = getDefaultProps(options);
  const { onStateChange } = props;
  const store = createStore(props.initialState as AutocompleteState<TItem>);

  const { onReset } = getEventHandlers({
    store,
    onStateChange,
    props,
  });
  const {
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
  } = getAutocompleteSetters({ store, onStateChange, props });
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  } = getPropGetters({
    store,
    onStateChange,
    props,
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
  });

  return {
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
    onReset,
  };
}

export { createAutocomplete };
