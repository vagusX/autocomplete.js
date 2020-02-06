import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getAutocompleteSetters<TItem>({ state, onStateChange }) {
  const setHighlightedIndex: AutocompleteState<
    TItem
  >['setHighlightedIndex'] = value => {
    state = stateReducer(state, { type: 'setHighlightedIndex', value });
    onStateChange({ state });
  };

  const setQuery: AutocompleteState<TItem>['setQuery'] = value => {
    state = stateReducer(state, { type: 'setQuery', value });
    onStateChange({ state });
  };

  const setSuggestions: AutocompleteState<TItem>['setSuggestions'] = value => {
    state = stateReducer(state, { type: 'setSuggestions', value });
    onStateChange({ state });
  };

  const setIsOpen: AutocompleteState<TItem>['setIsOpen'] = value => {
    state = stateReducer(state, { type: 'setIsOpen', value });
    onStateChange({ state });
  };

  const setStatus: AutocompleteState<TItem>['setStatus'] = value => {
    state = stateReducer(state, { type: 'setStatus', value });
    onStateChange({ state });
  };

  const setContext: AutocompleteState<TItem>['setContext'] = value => {
    state = stateReducer(state, { type: 'setContext', value });
    onStateChange({ state });
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
