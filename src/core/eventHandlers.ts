import { stateReducer } from './stateReducer';

import { AutocompleteState } from './types';

export function getEventHandlers<TItem>({ store, onStateChange, props }) {
  const onKeyDown: AutocompleteState<TItem>['onKeyDown'] = event => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Default browser behavior changes the caret placement on ArrowUp and
      // Arrow down.
      event.preventDefault();

      store.setState(
        stateReducer(
          store.getState(),
          {
            type: event.key,
            value: { shiftKey: event.shiftKey },
          },
          props
        )
      );
      onStateChange({ state: store.getState() });
    } else if (event.key === 'Escape') {
      // This prevents the default browser behavior on `input[type="search"]`
      // to remove the query right away because we first want to close the
      // dropdown.
      event.preventDefault();

      store.setState(
        stateReducer(
          store.getState(),
          {
            type: event.key,
            value: {},
          },
          props
        )
      );
      onStateChange({ state: store.getState() });
    }
  };

  const onReset: AutocompleteState<TItem>['onReset'] = () => {
    store.setState(
      stateReducer(store.getState(), { type: 'reset', value: {} }, props)
    );
    onStateChange({ state: store.getState() });
  };

  const onFocus: AutocompleteState<TItem>['onFocus'] = () => {
    store.setState(
      stateReducer(store.getState(), { type: 'focus', value: {} }, props)
    );
    onStateChange({ state: store.getState() });
  };

  return {
    onKeyDown,
    onReset,
    onFocus,
  };
}
