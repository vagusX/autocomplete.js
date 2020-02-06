import { AutocompleteState } from './types';

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
  console.info('stateReducer', action.type);

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

    case 'ArrowUp': {
      return {
        ...state,
        highlightedIndex: state.highlightedIndex - 1,
      };
    }

    case 'ArrowDown': {
      return {
        ...state,
        highlightedIndex: state.highlightedIndex + 1,
      };
    }

    default:
      return state;
  }
};
