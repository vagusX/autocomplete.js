import { AutocompleteState } from './types';

export function getItemsCount(state: AutocompleteState<unknown>) {
  if (state.suggestions.length === 0) {
    return 0;
  }

  return state.suggestions.reduce<number>(
    (sum, suggestion) => sum + suggestion.items.length,
    0
  );
}

export function getNextHighlightedIndex(
  moveAmount: number,
  baseIndex: number,
  itemCount: number
) {
  const itemsLastIndex = itemCount - 1;

  if (
    typeof baseIndex !== 'number' ||
    baseIndex < 0 ||
    baseIndex >= itemCount
  ) {
    baseIndex = moveAmount > 0 ? -1 : itemsLastIndex + 1;
  }

  let newIndex = baseIndex + moveAmount;

  if (newIndex < 0) {
    newIndex = itemsLastIndex;
  } else if (newIndex > itemsLastIndex) {
    newIndex = 0;
  }

  return newIndex;
}
