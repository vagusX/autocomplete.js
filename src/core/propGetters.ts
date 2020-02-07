import { stateReducer } from './stateReducer';
import { isSpecialClick, getSuggestionFromHighlightedIndex } from './utils';

import {
  GetInputProps,
  GetItemProps,
  GetLabelProps,
  GetMenuProps,
} from './types';

export function getPropGetters({
  store,
  onStateChange,
  props,
  setHighlightedIndex,
  setQuery,
  setSuggestions,
  setIsOpen,
  setStatus,
  setContext,
}) {
  const getInputProps: GetInputProps = getterProps => {
    return {
      'aria-autocomplete': 'list',
      'aria-activedescendant':
        store.getState().isOpen && props.highlightedIndex >= 0
          ? `${props.id}-item-${store.getState().highlightedIndex}`
          : null,
      'aria-controls': store.getState().isOpen ? `${props.id}-menu` : null,
      'aria-labelledby': `${props.id}-label`,
      value: store.getState().query,
      id: `${props.id}-input`,
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: false,
      autofocus: props.autoFocus,
      placeholder: props.showCompletion ? '' : props.placeholder,
      // @TODO: see if this accessibility attribute is necessary
      // 'aria-expanded': store.getStore().isOpen,
      onInput(event: InputEvent) {
        const query = (event.currentTarget as HTMLInputElement).value;

        setHighlightedIndex(0);
        setStatus('loading');
        setQuery(query);

        props
          .getSources({
            query,
            state: store.getState(),
            setHighlightedIndex,
            setQuery,
            setSuggestions,
            setIsOpen,
            setStatus,
            setContext,
          })
          .then(sources => {
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
                setSuggestions(suggestions);
                setIsOpen(
                  props.shouldDropdownOpen({ state: store.getState() })
                );
              })
              .catch(error => {
                setStatus('error');

                throw error;
              });
          });
      },
      onKeyDown(event: KeyboardEvent) {
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
          onStateChange({ state: store.getState() });
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
          onStateChange({ state: store.getState() });
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
          const item = suggestion.items[store.getState().highlightedIndex];
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
            onStateChange({ state: store.getState() });

            if (itemUrl !== undefined) {
              props.navigator.navigate({
                suggestionUrl: itemUrl,
                suggestion: item,
                state: store.getState(),
              });
            }
          }
        }
      },
      onFocus() {
        store.setState(
          stateReducer(store.getState(), { type: 'focus', value: {} }, props)
        );
        onStateChange({ state: store.getState() });
      },
      onBlur() {
        store.setState(
          stateReducer(
            store.getState(),
            {
              type: 'blur',
              value: null,
            },
            props
          )
        );
        onStateChange({ state: store.getState() });
      },
      ...getterProps,
    };
  };

  const getItemProps: GetItemProps<any> = getterProps => {
    if (getterProps.item === undefined) {
      throw new Error('`getItemProps` expects an `item`.');
    }

    return {
      id: `${props.id}-item-${getterProps.item.__autocomplete_id}`,
      role: 'option',
      'aria-selected':
        store.getState().highlightedIndex ===
        getterProps.item.__autocomplete_id,
      onMouseMove() {
        if (
          getterProps.item.__autocomplete_id ===
          store.getState().highlightedIndex
        ) {
          return;
        }

        store.setState(
          stateReducer(
            store.getState(),
            {
              type: 'mousemove',
              value: getterProps.item.__autocomplete_id,
            },
            props
          )
        );
        onStateChange({ state: store.getState() });
      },
      onMouseDown(event: MouseEvent) {
        // Prevents the `activeElement` from being changed to the item so it
        // can remain with the current `activeElement`.
        event.preventDefault();
      },
      onClick(event: MouseEvent) {
        // We ignore all modified clicks to support default browsers' behavior.
        if (isSpecialClick(event)) {
          return;
        }

        store.setState(
          stateReducer(
            store.getState(),
            {
              type: 'click',
              value: getterProps.source.getInputValue({
                suggestion: getterProps.item,
                state: store.getState(),
              }),
            },
            props
          )
        );
        onStateChange({ state: store.getState() });
      },
      ...getterProps,
    };
  };

  const getLabelProps: GetLabelProps = getterProps => {
    return {
      htmlFor: `${props.id}-input`,
      id: `${props.id}-label`,
      ...getterProps,
    };
  };

  const getMenuProps: GetMenuProps = getterProps => {
    return {
      role: 'listbox',
      'aria-labelledby': `${props.id}-label`,
      id: `${props.id}-menu`,
      ...getterProps,
    };
  };

  return {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  };
}
