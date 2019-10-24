/** @jsx h */

import { h } from 'preact';

export type Template = (data: any) => string | JSX.Element;

interface TemplateProps {
  template?: Template;
  defaultTemplate?: Template;
  data?: any;
  tagName?: string;
  rootProps: { [prop: string]: any };
}

export const Template = ({
  template,
  defaultTemplate = () => '',
  data = {},
  tagName: TagName = 'div',
  rootProps,
}: TemplateProps) => {
  const renderTemplate = template || defaultTemplate;
  const content = renderTemplate(data);

  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    // @ts-ignore
    // TypeScript isn't aware that `TagName` is an element.
    return (
      <TagName {...rootProps} dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  return content;
};
