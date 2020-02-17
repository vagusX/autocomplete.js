import { useEffect, Ref } from 'preact/hooks';

import { AutocompleteOptions } from '../autocomplete-core/types';
import { RendererProps } from './Autocomplete';

export function useKeyboardShortcuts<TItem>(
  rendererProps: RendererProps,
  props: AutocompleteOptions<TItem>,
  inputRef: Ref<HTMLInputElement | null>
) {
  useEffect(() => {
    function onGlobalKeyDown(event: KeyboardEvent): void {
      if (!inputRef.current) {
        return;
      }

      const element = event.target as HTMLElement;
      const tagName = element.tagName;

      // Do not trigger the focus if we're already editing text.
      if (
        element.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'SELECT' ||
        tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Do not trigger the focus if the shortcut is not correct.
      if (rendererProps.keyboardShortcuts.indexOf(event.key) === -1) {
        return;
      }

      inputRef.current.focus();

      event.stopPropagation();
      event.preventDefault();
    }

    if (rendererProps.keyboardShortcuts.length > 0) {
      props.environment.addEventListener('keydown', onGlobalKeyDown);
    }

    return () => {
      if (rendererProps.keyboardShortcuts.length > 0) {
        props.environment.removeEventListener('keydown', onGlobalKeyDown);
      }
    };
  }, [props.environment, rendererProps.keyboardShortcuts, inputRef]);
}
