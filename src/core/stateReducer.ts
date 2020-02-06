import { AutocompleteState } from './types';
import { getItemsCount, getNextHighlightedIndex } from './utils';

type ActionType =
  | 'setHighlightedIndex'
  | 'setQuery'
  | 'setSuggestions'
  | 'setIsOpen'
  | 'setStatus'
  | 'setContext'
  | 'ArrowUp'
  | 'ArrowDown';

interface Action {
  type: ActionType;
  value: any;
}

export const stateReducer = <TItem>(
  state: AutocompleteState<TItem>,
  action: Action
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

    default:
      return state;
  }
};
