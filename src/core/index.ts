import { createStore } from './store';
import { getAccessibilityGetters } from './accessibilityGetters';
import { getAutocompleteSetters } from './autocompleteSetters';
import { getEventHandlers } from './eventHandlers';
import { normalizeGetSources } from './sources';

import {
  AutocompleteOptions,
  AutocompleteState,
  AutocompleteInstance,
} from './types';

type AutocompleteItem = {
  id: string;
  isActive: boolean;
};
let autocompleteId = 0;

const generateAutocompleteId = () => {
  return `autocomplete-${autocompleteId++}`;
};

type CreateAutocomplete = <TItem>(
  options: AutocompleteOptions<TItem>
) => AutocompleteInstance<TItem>;

const createAutocomplete: CreateAutocomplete = <
  TItem // extends AutocompleteItem
>({
  id = generateAutocompleteId(),
  onStateChange,
  initialState,
  getSources: originalGetSources,
}) => {
  const state: AutocompleteState<TItem> = {
    highlightedIndex: 0,
    query: '',
    suggestions: [],
    isOpen: false,
    status: 'idle',
    statusContext: {},
    context: {},
    ...initialState,
  };
  const store = createStore(state);
  const getSources = normalizeGetSources(originalGetSources);

  const { onKeyDown } = getEventHandlers({ store, onStateChange });
  const {
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
  } = getAutocompleteSetters({ store, onStateChange });
  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  } = getAccessibilityGetters(id, store);

  const onInput = (event: InputEvent) => {
    const query = (event.currentTarget as HTMLInputElement).value;

    setHighlightedIndex(0);
    setStatus('loading');
    setQuery(query);

    getSources({
      query,
      state: store.getState(),
      setHighlightedIndex,
      setQuery,
      setSuggestions,
      setIsOpen,
      setStatus,
      setContext,
    }).then(sources => {
      setStatus('loading');

      // @TODO: convert `Promise.all` to fetching strategy.
      return Promise.all(
        sources.map(source => {
          return Promise.resolve(
            source.getSuggestions({
              query,
              state: store.getState(),
              setHighlightedIndex,
              setQuery,
              setSuggestions,
              setIsOpen,
              setStatus,
              setContext,
            })
          ).then(items => {
            return {
              source,
              items,
            };
          });
        })
      )
        .then(suggestions => {
          setStatus('idle');
          setIsOpen(true);
          setSuggestions(suggestions);
        })
        .catch(error => {
          setStatus('error');

          throw error;
        });
    });
  };

  return {
    setHighlightedIndex,
    setQuery,
    setSuggestions,
    setIsOpen,
    setStatus,
    setContext,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    onKeyDown,
    onInput,
  };
};

export { createAutocomplete };
