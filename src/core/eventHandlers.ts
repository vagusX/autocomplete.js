import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getEventHandlers<TItem>({ store, onStateChange }) {
  const onKeyDown: AutocompleteState<TItem>['onKeyDown'] = event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Default browser behavior changes the caret placement on ArrowUp and
      // Arrow down.
      event.preventDefault();

      store.setState(
        stateReducer(store.getState(), {
          type: event.key,
          value: { shiftKey: event.shiftKey },
        })
      );
      onStateChange({ state: store.getState() });
    }
  };

  return {
    onKeyDown,
  };
}
