import { stateReducer } from './stateReducer';
import { onInput } from './onInput';

import { AutocompleteInstance } from './types';

export function getEventHandlers<TItem>({
  store,
  props,
  setHighlightedIndex,
  setQuery,
  setSuggestions,
  setIsOpen,
  setStatus,
  setContext,
}) {
  const onReset: AutocompleteInstance<TItem>['onReset'] = () => {
    if (props.minLength === 0) {
      onInput({
        query: '',
        store,
        props,
        setHighlightedIndex,
        setQuery,
        setSuggestions,
        setIsOpen,
        setStatus,
        setContext,
      });
    }

    store.setState(
      stateReducer(store.getState(), { type: 'reset', value: {} }, props)
    );
    props.onStateChange({ state: store.getState() });
  };

  return {
    onReset,
  };
}
