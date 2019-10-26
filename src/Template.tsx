/** @jsx h */

import { h } from 'preact';
import { AutocompleteState } from './Autocomplete';

interface TemplateData {
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
  tagName: TagName = 'div',
  rootProps,
}: TemplateProps<TData & TemplateData>) => {
  const renderTemplate = template || defaultTemplate;
  const content = renderTemplate(data);

  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return (
      // @ts-ignore
      // TypeScript isn't aware that `TagName` is an element.
      <TagName {...rootProps} dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  // @ts-ignore
  return <TagName {...rootProps}>{content}</TagName>;
};
