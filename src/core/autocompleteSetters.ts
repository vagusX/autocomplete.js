import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getAutocompleteSetters<TItem>({ store, onStateChange }) {
  const setHighlightedIndex: AutocompleteState<
    TItem
  >['setHighlightedIndex'] = value => {
    store.setState(
      stateReducer(store.getState(), { type: 'setHighlightedIndex', value })
    );
    onStateChange({ state: store.getState() });
  };

  const setQuery: AutocompleteState<TItem>['setQuery'] = value => {
    store.setState(stateReducer(store.getState(), { type: 'setQuery', value }));
    onStateChange({ state: store.getState() });
  };

  const setSuggestions: AutocompleteState<
    TItem
  >['setSuggestions'] = rawValue => {
    let baseItemId = 0;
    const value = rawValue.map(suggestion => ({
      ...suggestion,
      items: suggestion.items.map(item => ({
        ...item,
        __autocomplete_id: baseItemId++,
      })),
    }));

    store.setState(
      stateReducer(store.getState(), { type: 'setSuggestions', value })
    );
    onStateChange({ state: store.getState() });
  };

  const setIsOpen: AutocompleteState<TItem>['setIsOpen'] = value => {
    store.setState(
      stateReducer(store.getState(), { type: 'setIsOpen', value })
    );
    onStateChange({ state: store.getState() });
  };

  const setStatus: AutocompleteState<TItem>['setStatus'] = value => {
    store.setState(
      stateReducer(store.getState(), { type: 'setStatus', value })
    );
    onStateChange({ state: store.getState() });
  };

  const setContext: AutocompleteState<TItem>['setContext'] = value => {
    store.setState(
      stateReducer(store.getState(), { type: 'setContext', value })
    );
    onStateChange({ state: store.getState() });
  };

  return {
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
  };
}
