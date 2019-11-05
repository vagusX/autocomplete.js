/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';

import { Template } from '../Template';

const data = {
  suggestion: { value: 'Banana', url: '/banana' },
  state: {
    isOpen: false,
    isStalled: false,
    isLoading: false,
    error: null,
    query: '',
    results: [],
    metadata: {},
  },
  setState: jest.fn(),
};

describe('Template', () => {
  test('renders string template', () => {
    const template = jest.fn(
      ({ suggestion }) => `<a href="${suggestion.url}">${suggestion.value}</a>`
    );

    const { container } = render(<Template template={template} data={data} />);

    expect(template).toHaveBeenCalledTimes(1);
    expect(template).toHaveBeenCalledWith(data);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <a
            href="/banana"
          >
            Banana
          </a>
        </div>
      </div>
    `);
  });

  test('renders JSX template', () => {
    const template = jest.fn(({ suggestion }) => (
      <a href={suggestion.url}>{suggestion.value}</a>
    ));

    const { container } = render(<Template template={template} data={data} />);

    expect(template).toHaveBeenCalledTimes(1);
    expect(template).toHaveBeenCalledWith(data);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <a
            href="/banana"
          >
            Banana
          </a>
        </div>
      </div>
    `);
  });

  test('renders the template if defined with default template', () => {
    const template = jest.fn(
      ({ suggestion }) => `<a href="${suggestion.url}">${suggestion.value}</a>`
    );

    const { container } = render(
      <Template template={template} defaultTemplate={() => ''} data={data} />
    );

    expect(template).toHaveBeenCalledTimes(1);
    expect(template).toHaveBeenCalledWith(data);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <a
            href="/banana"
          >
            Banana
          </a>
        </div>
      </div>
    `);
  });

  test('renders the default template when no template', () => {
    const defaultTemplate = jest.fn(
      ({ suggestion }) => `<a href="${suggestion.url}">${suggestion.value}</a>`
    );

    const { container } = render(
      <Template defaultTemplate={defaultTemplate} data={data} />
    );

    expect(defaultTemplate).toHaveBeenCalledTimes(1);
    expect(defaultTemplate).toHaveBeenCalledWith(data);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <a
            href="/banana"
          >
            Banana
          </a>
        </div>
      </div>
    `);
  });

  test('renders with a custom tag name', () => {
    const template = jest.fn(
      ({ suggestion }) => `<a href="${suggestion.url}">${suggestion.value}</a>`
    );

    const { container } = render(
      <Template tagName="section" template={template} data={data} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section>
          <a
            href="/banana"
          >
            Banana
          </a>
        </section>
      </div>
    `);
  });

  test('renders with root props', () => {
    const template = jest.fn(
      ({ suggestion }) => `<a href="${suggestion.url}">${suggestion.value}</a>`
    );

    const { container } = render(
      <Template
        tagName="section"
        rootProps={{ className: 'root' }}
        template={template}
        data={data}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="root"
        >
          <a
            href="/banana"
          >
            Banana
          </a>
        </section>
      </div>
    `);
  });
});
