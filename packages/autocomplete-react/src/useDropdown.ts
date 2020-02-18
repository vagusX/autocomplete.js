import { useRef, useLayoutEffect, Ref } from 'preact/hooks';
import { createPopper } from '@popperjs/core/lib/popper-lite';

import { AutocompleteState } from '@francoischalifour/autocomplete-core';
import { RendererProps } from './Autocomplete';

function getDropdownPlacement(props: RendererProps) {
  if (props.mobileMediaQuery.matches) {
    return 'bottom';
  }

  switch (props.dropdownPlacement) {
    case 'end':
      return 'bottom-end';
    default:
      return 'bottom-start';
  }
}

interface GetDropdownPositionParams {
  searchBoxElement: Element;
  props: RendererProps;
}

function getDropdownPosition({
  searchBoxElement,
  props,
}: GetDropdownPositionParams) {
  // On mobile, we use the horizontal properties of the search box to align the
  // dropdown below it and the vertical properties of the dropdown container to
  // render the dropdown full width.
  if (props.mobileMediaQuery.matches) {
    return {
      getBoundingClientRect: () => {
        const {
          y,
          height,
          top,
          bottom,
        } = searchBoxElement.getBoundingClientRect();
        const {
          x,
          width,
          right,
          left,
        } = props.dropdownContainer.getBoundingClientRect();

        return {
          x,
          y,
          width,
          height,
          top,
          right,
          bottom,
          left,
        };
      },
    };
  }

  // On desktop, the search box is used as reference to compute both horizontal
  // and vertical properties.
  return searchBoxElement;
}

export function useDropdown<TItem>(
  props: RendererProps,
  state: AutocompleteState<TItem>,
  searchBoxRef: Ref<HTMLFormElement | null>,
  dropdownRef: Ref<HTMLDivElement | null>
) {
  const popper = useRef<ReturnType<typeof createPopper> | null>(null);

  useLayoutEffect(() => {
    if (searchBoxRef.current && dropdownRef.current) {
      popper.current = createPopper(
        getDropdownPosition({
          searchBoxElement: searchBoxRef.current,
          props,
        }),
        dropdownRef.current,
        {
          placement: getDropdownPlacement(props),
          modifiers: [
            // By default, Popper overrides the `margin` style to `0` because it
            // is known to cause issues when computing the position.
            // We consider this as a problem in Autocomplete because it prevents
            // users from setting different desktop/mobile styles in CSS.
            // If we leave Popper override `margin`, users would have to use the
            // `!important` CSS keyword or we would have to expose a JavaScript
            // API.
            // See https://github.com/francoischalifour/autocomplete.js/pull/25
            {
              name: 'unsetMargins',
              enabled: true,
              phase: 'beforeWrite',
              requires: ['computeStyles'],
              fn: ({ state }) => {
                state.styles.popper.margin = '';
              },
            },
            {
              name: 'fullWidthMobile',
              enabled: props.mobileMediaQuery.matches,
              phase: 'beforeWrite',
              requires: ['computeStyles'],
              fn: ({ state }) => {
                state.styles.popper.width = `${props.dropdownContainer.clientWidth}px`;
              },
            },
          ],
        }
      );
    }

    return () => {
      popper.current?.destroy();
    };
  }, [searchBoxRef, dropdownRef, props]);

  useLayoutEffect(() => {
    if (state.isOpen) {
      popper.current?.update();
    }
  }, [state.isOpen]);
}
