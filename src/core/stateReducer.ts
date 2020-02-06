import { getItemsCount, getNextHighlightedIndex } from './utils';

import { AutocompleteState, AutocompleteOptions } from './types';

type ActionType =
  | 'setHighlightedIndex'
  | 'setQuery'
  | 'setSuggestions'
  | 'setIsOpen'
  | 'setStatus'
  | 'setContext'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'reset'
  | 'focus';

interface Action {
  type: ActionType;
  value: any;
}

export const stateReducer = <TItem>(
  state: AutocompleteState<TItem>,
  action: Action,
  props: AutocompleteOptions<TItem>
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
        context: action.value,
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

    default:
      return state;
  }
};
