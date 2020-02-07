import { getItemsCount, getNextHighlightedIndex } from './utils';

import { AutocompleteState, RequiredAutocompleteOptions } from './types';

type ActionType =
  | 'setHighlightedIndex'
  | 'setQuery'
  | 'setSuggestions'
  | 'setIsOpen'
  | 'setStatus'
  | 'setContext'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Escape'
  | 'Enter'
  | 'reset'
  | 'focus'
  | 'mousemove'
  | 'click'
  | 'blur';

interface Action {
  type: ActionType;
  value: any;
}

export const stateReducer = <TItem>(
  state: AutocompleteState<TItem>,
  action: Action,
  props: RequiredAutocompleteOptions<TItem>
): AutocompleteState<TItem> => {
  switch (action.type) {
    case 'setHighlightedIndex': {
      return {
        ...state,
        highlightedIndex: action.value,
      };
    }

    case 'setQuery': {
      return {
        ...state,
        query: action.value,
      };
    }

    case 'setSuggestions': {
      return {
        ...state,
        suggestions: action.value,
      };
    }

    case 'setIsOpen': {
      return {
        ...state,
        isOpen: action.value,
      };
    }

    case 'setStatus': {
      return {
        ...state,
        status: action.value,
      };
    }

    case 'setContext': {
      return {
        ...state,
        context: {
          ...state.context,
          ...action.value,
        },
      };
    }

    case 'ArrowDown': {
      return {
        ...state,
        highlightedIndex: getNextHighlightedIndex(
          action.value.shiftKey ? 5 : 1,
          state.highlightedIndex,
          getItemsCount(state)
        ),
      };
    }

    case 'ArrowUp': {
      return {
        ...state,
        highlightedIndex: getNextHighlightedIndex(
          action.value.shiftKey ? -5 : -1,
          state.highlightedIndex,
          getItemsCount(state)
        ),
      };
    }

    case 'Escape': {
      if (state.isOpen) {
        return {
          ...state,
          isOpen: false,
        };
      }

      return {
        ...state,
        query: '',
        status: 'idle',
        statusContext: {},
        suggestions: [],
      };
    }

    case 'reset': {
      // @TODO: support with menu opening by default
      return {
        ...state,
        highlightedIndex: -1,
        isOpen: false,
        status: 'idle',
        statusContext: {},
        query: '',
        suggestions: [],
      };
    }

    case 'focus': {
      return {
        ...state,
        isOpen: state.query.length >= props.minLength,
      };
    }

    case 'blur': {
      // In development mode, we prefer keeping the dropdown open on blur
      // to better leverage the browser inspect tools.
      if (__DEV__) {
        return state;
      }

      return {
        ...state,
        isOpen: false,
        highlightedIndex: -1,
      };
    }

    case 'mousemove': {
      return {
        ...state,
        highlightedIndex: action.value,
      };
    }

    case 'Enter':
    case 'click': {
      return {
        ...state,
        isOpen: !state.isOpen,
        highlightedIndex: -1,
        query: action.value,
      };
    }

    default:
      return state;
  }
};
