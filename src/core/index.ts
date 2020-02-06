import { createStore } from './store';
import { getAccessibilityGetters } from './accessibilityGetters';
import { getAutocompleteSetters } from './autocompleteSetters';
import { getEventHandlers } from './eventHandlers';
import { normalizeGetSources } from './sources';
import { getItemsCount } from './utils';

import {
  AutocompleteOptions,
  AutocompleteState,
  AutocompleteInstance,
  RequiredAutocompleteOptions,
} from './types';

let autocompleteId = 0;

const generateAutocompleteId = () => {
  return `autocomplete-${autocompleteId++}`;
};

type CreateAutocomplete = <TItem>(
  options: AutocompleteOptions<TItem>
) => AutocompleteInstance<TItem>;

function getDefaultProps<TItem>(
  props: AutocompleteOptions<TItem>
): RequiredAutocompleteOptions<TItem> {
  const environment =
    typeof window !== 'undefined' ? window : ({} as typeof window);

  return {
    id: generateAutocompleteId(),
    minLength: 1,
    showCompletion: false,
    stallThreshold: 300,
    environment,
    navigator: {
      navigate({ suggestionUrl }) {
        environment.location.assign(suggestionUrl);
      },
      navigateNewTab({ suggestionUrl }) {
        const windowReference = environment.open(
          suggestionUrl,
          '_blank',
          'noopener'
        );

        if (windowReference) {
          windowReference.focus();
        }
      },
      navigateNewWindow({ suggestionUrl }) {
        environment.open(suggestionUrl, '_blank', 'noopener');
      },
      ...props.navigator,
    },
    initialState: {
      highlightedIndex: 0,
      query: '',
      suggestions: [],
      isOpen: false,
      status: 'idle',
      statusContext: {},
      context: {},
      ...props.initialState,
    },
    getSources: normalizeGetSources(props.getSources),
    shouldDropdownOpen: ({ state }) => getItemsCount(state) > 0,
    ...props,
  };
}

const createAutocomplete: CreateAutocomplete = <
  TItem // extends AutocompleteItem
>(
  props: AutocompleteOptions<TItem>
) => {
  const { id, onStateChange, initialState, getSources } = getDefaultProps(
    props
  );

  const store = createStore(initialState as AutocompleteState<TItem>);

  const { onKeyDown, onReset, onFocus } = getEventHandlers({
    store,
    onStateChange,
    props,
  });
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

    Promise.resolve(
      getSources({
        query,
        state: store.getState(),
        setHighlightedIndex,
        setQuery,
        setSuggestions,
        setIsOpen,
        setStatus,
        setContext,
      })
    ).then(sources => {
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
    onFocus,
    onReset,
  };
};

export { createAutocomplete };
