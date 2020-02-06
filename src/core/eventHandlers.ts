import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getEventHandlers<TItem>({ state, onStateChange }) {
  const onKeyDown: AutocompleteState<TItem>['onKeyDown'] = event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      state = stateReducer(state, { type: event.key, value: {} });
      onStateChange({ state });
    }
  };

  return {
    onKeyDown,
  };
}
