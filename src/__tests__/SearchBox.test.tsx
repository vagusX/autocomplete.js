/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { SearchBox, SearchBoxProps } from '../SearchBox';

const settersExpectation = {
  setQuery: expect.any(Function),
  setResults: expect.any(Function),
  setIsOpen: expect.any(Function),
  setIsLoading: expect.any(Function),
  setIsStalled: expect.any(Function),
  setError: expect.any(Function),
  setContext: expect.any(Function),
};

const inputId = 'autocomplete-0-input';

function getDefaultProps(): SearchBoxProps {
  return {
    placeholder: '',
    autofocus: false,
    completion: '',
    setters: {
      setQuery: jest.fn(),
      setResults: jest.fn(),
      setIsOpen: jest.fn(),
      setIsLoading: jest.fn(),
      setIsStalled: jest.fn(),
      setError: jest.fn(),
      setContext: jest.fn(),
    },
    internalState: {
      query: '',
      isLoading: false,
      isStalled: false,
      isOpen: false,
      error: null,
      results: [],
      context: {},
    },
    onFocus: jest.fn(),
    onKeyDown: jest.fn(),
    onInput: jest.fn(),
    onReset: jest.fn(),
    onSubmit: jest.fn(),
    onInputRef: {
      current: null,
    },
    getInputProps: (options?: object) => ({
      ...options,
      id: inputId,
    }),
  };
}

describe('SearchBox', () => {
  test('should generate the correct DOM', () => {
    const props = {
      ...getDefaultProps(),
    };

    const { container } = render(<SearchBox {...props} />);
    const form = container.querySelector('.algolia-autocomplete-form');
    const magnifierLabel = container.querySelector(
      '.algolia-autocomplete-magnifierLabel'
    );
    const loadingIndicator = container.querySelector(
      '.algolia-autocomplete-loadingIndicator'
    );
    const input = container.querySelector('.algolia-autocomplete-input');
    const reset = container.querySelector('.algolia-autocomplete-reset');

    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('novalidate', '');
    expect(form).toHaveAttribute('role', 'search');
    expect(magnifierLabel).toBeInTheDocument();
    expect(magnifierLabel).toHaveAttribute('for', inputId);
    expect(loadingIndicator).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('autocapitalize', 'off');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('id', inputId);
    expect(reset).toHaveAttribute('hidden', '');
    expect(reset).toHaveAttribute('type', 'reset');
  });

  describe('placeholder', () => {
    test('should allow custom placeholders', () => {
      const props = {
        ...getDefaultProps(),
        placeholder: 'Search placeholder',
      };

      const { getByPlaceholderText } = render(<SearchBox {...props} />);
      const input = getByPlaceholderText('Search placeholder');

      expect(input).toBeInTheDocument();
    });
  });

  describe('query', () => {
    test('should have the query prop as input', () => {
      const props = {
        ...getDefaultProps(),
        internalState: {
          ...getDefaultProps().internalState,
          query: 'Search query',
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector('.algolia-autocomplete-input');
      const reset = container.querySelector('button[type="reset"]');

      expect(input).toHaveValue(props.internalState.query);
      expect(reset).toBeVisible();
    });
  });

  describe('completion', () => {
    test('should show the completion with a completion value', () => {
      const props = {
        ...getDefaultProps(),
        completion: 'Query',
        internalState: {
          ...getDefaultProps().internalState,
          query: 'Que',
          isOpen: true,
          isStalled: false,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const completion = container.querySelector(
        '.algolia-autocomplete-completion'
      );

      expect(completion).toBeInTheDocument();
      expect(completion).toHaveTextContent('Query');
    });

    test('should not show the completion when empty', () => {
      const props = {
        ...getDefaultProps(),
        completion: '',
        internalState: {
          ...getDefaultProps().internalState,
          query: 'Que',
          isOpen: true,
          isStalled: false,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const completion = container.querySelector(
        '.algolia-autocomplete-completion'
      );

      expect(completion).not.toBeInTheDocument();
    });

    test('should not show the completion when is the menu is closed', () => {
      const props = {
        ...getDefaultProps(),
        completion: 'Query',
        internalState: {
          ...getDefaultProps().internalState,
          query: 'Que',
          isOpen: false,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const completion = container.querySelector(
        '.algolia-autocomplete-completion'
      );

      expect(completion).not.toBeInTheDocument();
    });

    test('should not show the completion when is the search is stalled', () => {
      const props = {
        ...getDefaultProps(),
        completion: 'Query',
        internalState: {
          ...getDefaultProps().internalState,
          query: 'Que',
          isOpen: true,
          isStalled: true,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const completion = container.querySelector(
        '.algolia-autocomplete-completion'
      );

      expect(completion).not.toBeInTheDocument();
    });

    // This test is to avoid having a placeholder showing at the same time as
    // a completion.
    // This can happen when `minLength` is set to 0.
    test('should hide the placeholder when showing the completion', () => {
      const props = {
        ...getDefaultProps(),
        placeholder: 'Search…',
        completion: 'Query',
        internalState: {
          ...getDefaultProps().internalState,
          query: '',
          isOpen: true,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector('.algolia-autocomplete-input');

      expect(input).toHaveAttribute('placeholder', '');
    });
  });

  describe('events', () => {
    test('should call onFocus prop on input focus', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      expect(props.onFocus).toHaveBeenCalledTimes(0);

      input.focus();

      expect(props.onFocus).toHaveBeenCalledTimes(1);

      userEvent.type(input, 'hello');
      input.blur();

      expect(props.onFocus).toHaveBeenCalledTimes(1);

      input.focus();
      userEvent.type(input, ' there');

      expect(props.onFocus).toHaveBeenCalledTimes(2);
    });

    // This test ensures that the menu opens again when clicking on the input
    // although the input is already focused.
    // This can happen when the menu was closed (e.g. hitting escape) but still
    // having the focus on the input.
    test('should call onFocus prop on click on the input when menu is closed', () => {
      const props = {
        ...getDefaultProps(),
        internalState: {
          ...getDefaultProps().internalState,
          isOpen: false,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      expect(props.onFocus).toHaveBeenCalledTimes(0);

      input.click();

      expect(props.onFocus).toHaveBeenCalledTimes(1);
      expect(props.onFocus).toHaveBeenCalledWith({
        state: expect.any(Object),
        ...settersExpectation,
      });
    });

    test('should not call onFocus prop on click on the input when menu is open', () => {
      const props = {
        ...getDefaultProps(),
        internalState: {
          ...getDefaultProps().internalState,
          isOpen: true,
        },
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      expect(props.onFocus).toHaveBeenCalledTimes(0);

      input.click();

      expect(props.onFocus).toHaveBeenCalledTimes(0);
    });

    test('should call onKeyDown prop on key down on the input', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      fireEvent.keyDown(input, { key: 'a', code: 65 });

      expect(props.onKeyDown).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(input, { key: 'Enter', code: 13 });

      expect(props.onKeyDown).toHaveBeenCalledTimes(2);
    });

    test('should call onInput prop on input change', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      userEvent.type(input, 'hello');

      expect(props.onInput).toHaveBeenCalledTimes(5);
      expect(props.onInput).toHaveBeenCalledWith(expect.any(Event));
    });

    // @TODO: this test will pass with Jest 25.x
    test.skip('should call onReset prop on click on the reset button', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<SearchBox {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );
      const resetButton = container.querySelector('button[type="reset"]');

      userEvent.click(resetButton);

      expect(props.onReset).toHaveBeenCalledTimes(1);
      expect(props.onReset).toHaveBeenCalledWith(expect.any(Event));
      expect(input).toHaveFocus();
    });
  });
});
