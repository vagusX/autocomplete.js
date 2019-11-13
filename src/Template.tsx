/** @jsx h */

import { createElement } from 'preact';

import { AutocompleteState, AutocompleteSetters } from './types';
import { convertToPreactChildren } from './utils';

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
