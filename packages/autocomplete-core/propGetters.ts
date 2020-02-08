import { stateReducer } from './stateReducer';
import { onInput } from './onInput';
import { onKeyDown } from './onKeyDown';
import { isSpecialClick } from './utils';

import {
  GetRootProps,
  GetInputProps,
  GetItemProps,
  GetLabelProps,
  GetMenuProps,
} from './types';

export function getPropGetters({
  store,
  props,
  setHighlightedIndex,
  setQuery,
  setSuggestions,
  setIsOpen,
  setStatus,
  setContext,
}) {
  const getRootProps: GetRootProps = getterProps => {
    return {
      role: 'combobox',
      'aria-expanded': store.getState().isOpen,
      'aria-haspopup': 'listbox',
      'aria-owns': store.getState().isOpen ? `${props.id}-menu` : null,
      'aria-labelledby': `${props.id}-label`,
      ...getterProps,
    };
  };

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
      onInput: (event: InputEvent) => {
        onInput({
          query: (event.currentTarget as HTMLInputElement).value,
          store,
          props,
          setHighlightedIndex,
          setQuery,
          setSuggestions,
          setIsOpen,
          setStatus,
          setContext,
        });
      },
      onKeyDown: (event: KeyboardEvent) => {
        onKeyDown({
          event,
          store,
          props,
        });
      },
      onFocus() {
        // We want to trigger a query when `minLength` is `0` because the
        // dropdown should open with the current query.
        if (props.minLength === 0) {
          onInput({
            query: store.getState().query,
            store,
            props,
            setHighlightedIndex,
            setQuery,
            setSuggestions,
            setIsOpen,
            setStatus,
            setContext,
          });
        }

        store.setState(
          stateReducer(store.getState(), { type: 'focus', value: {} }, props)
        );
        props.onStateChange({ state: store.getState() });
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
        props.onStateChange({ state: store.getState() });
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
        props.onStateChange({ state: store.getState() });
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
        props.onStateChange({ state: store.getState() });
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
    getRootProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
  };
}
