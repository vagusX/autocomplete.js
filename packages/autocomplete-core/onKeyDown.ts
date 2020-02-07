import { stateReducer } from './stateReducer';
import {
  getSuggestionFromHighlightedIndex,
  getRelativeHighlightedIndex,
} from './utils';

import { AutocompleteStore, RequiredAutocompleteOptions } from './types';

interface OnKeyDownOptions<TItem> {
  event: KeyboardEvent;
  store: AutocompleteStore<TItem>;
  props: RequiredAutocompleteOptions<TItem>;
}

export function onKeyDown<TItem>({
  event,
  store,
  props,
}: OnKeyDownOptions<TItem>): void {
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
    props.onStateChange({ state: store.getState() });
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
    props.onStateChange({ state: store.getState() });
  } else if (event.key === 'Enter') {
    // This prevents the `onSubmit` event to be sent.
    event.preventDefault();

    if (store.getState().highlightedIndex < 0) {
      return;
    }

    const suggestion = getSuggestionFromHighlightedIndex({
      highlightedIndex: store.getState().highlightedIndex,
      state: store.getState(),
    });

    const item =
      suggestion.items[getRelativeHighlightedIndex({ store, suggestion })];
    const itemUrl = suggestion.source.getSuggestionUrl({
      suggestion: item,
      state: store.getState(),
    });
    const inputValue = suggestion.source.getInputValue({
      suggestion: item,
      state: store.getState(),
    });

    if (event.metaKey || event.ctrlKey) {
      if (itemUrl !== undefined) {
        props.navigator.navigateNewTab({
          suggestionUrl: itemUrl,
          suggestion: item,
          state: store.getState(),
        });
      }
    } else if (event.shiftKey) {
      if (itemUrl !== undefined) {
        props.navigator.navigateNewWindow({
          suggestionUrl: itemUrl,
          suggestion: item,
          state: store.getState(),
        });
      }
    } else if (event.altKey) {
      // Keep native browser behavior
    } else {
      store.setState(
        stateReducer(
          store.getState(),
          {
            type: 'Enter',
            value: inputValue,
          },
          props
        )
      );
      props.onStateChange({ state: store.getState() });

      if (itemUrl !== undefined) {
        props.navigator.navigate({
          suggestionUrl: itemUrl,
          suggestion: item,
          state: store.getState(),
        });
      }
    }
  }
}
