import { AutocompleteState } from './types';

type CreateStore<TItem> = (
  initialState: AutocompleteState<TItem>
) => {
  state: AutocompleteState<TItem>;
  getState(): AutocompleteState<TItem>;
  setState(nextState: AutocompleteState<TItem>): void;
};

export const createStore: CreateStore<any> = initialState => {
  return {
    state: initialState,
    getState() {
      return this.state;
    },
    setState(nextState) {
      this.state = nextState;
    },
  };
};
