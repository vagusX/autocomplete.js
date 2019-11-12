/** @jsx h */

import { createElement, toChildArray, ComponentChildren } from 'preact';

import { AutocompleteState, AutocompleteSetters } from './types';

interface TemplateData extends AutocompleteSetters {
  state: AutocompleteState;
}

export type Template<TData = {}> = (
  data: TemplateData & TData
) => string | JSX.Element;

interface TemplateProps<TData = {}> {
  data: TData;
  tagName?: string;
  rootProps?: { [prop: string]: any };
  template?: Template<TData>;
  defaultTemplate?: Template<TData>;
}

function convertToPreactChildren(children: ComponentChildren) {
  const elements = toChildArray(children);

  return elements.map(element => {
    if (typeof element === 'number' || typeof element === 'string') {
      return element;
    }

    return {
      ...element,
      // Preact expects an element to have `constructor` as `undefined`.
      // For React elements to be usable with Autocomplete.js, we need to
      // transform the elements with this key so that Preact understands them.
      // See https://github.com/preactjs/preact/blob/3d2edb6f3cd59b40f8021f36948bae90bf760683/src/create-element.js#L83-L89
      constructor: undefined,
      props: {
        ...element.props,
        children:
          element.props.children &&
          convertToPreactChildren(element.props.children),
      },
    };
  });
}

export const Template = <TData extends {}>({
  template,
  defaultTemplate = () => '',
  data,
  tagName = 'div',
  rootProps = {},
}: TemplateProps<TData & TemplateData>) => {
  const renderTemplate = template || defaultTemplate;
  const content = renderTemplate(data);

  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return createElement(tagName, {
      ...rootProps,
      dangerouslySetInnerHTML: { __html: content },
    });
  }

  const element = createElement(tagName, rootProps, content);

  return convertToPreactChildren(element);
};
