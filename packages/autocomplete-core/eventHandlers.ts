import { stateReducer } from './stateReducer';

import { AutocompleteInstance } from './types';

export function getEventHandlers<TItem>({ store, onStateChange, props }) {
  const onReset: AutocompleteInstance<TItem>['onReset'] = () => {
    store.setState(
      stateReducer(store.getState(), { type: 'reset', value: {} }, props)
    );
    onStateChange({ state: store.getState() });
  };

  return {
    onReset,
  };
}
