import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getEventHandlers<TItem>({ store, onStateChange }) {
  const onKeyDown: AutocompleteState<TItem>['onKeyDown'] = event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      store.setState(
        stateReducer(store.getState(), { type: event.key, value: {} })
      );
      onStateChange({ state: store.getState() });
    }
  };

  return {
    onKeyDown,
  };
}
