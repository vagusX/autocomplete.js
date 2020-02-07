import { getDefaultProps } from './defaultProps';
import { createStore } from './store';
import { getPropGetters } from './propGetters';
import { getAutocompleteSetters } from './autocompleteSetters';
import { getEventHandlers } from './eventHandlers';

import { AutocompleteOptions, AutocompleteInstance } from './types';

function createAutocomplete<TItem extends {}>(
  options: AutocompleteOptions<TItem>
): AutocompleteInstance<TItem> {
  const props = getDefaultProps(options);
  const { onStateChange } = props;
  const store = createStore(props.initialState);

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
