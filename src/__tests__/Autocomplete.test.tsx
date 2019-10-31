/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Autocomplete } from '../Autocomplete';

function createEnvironment() {
  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setTimeout: jest.fn(),
    document: window.document,
  };
}

const defaultSource = {
  getSuggestionValue: ({ suggestion }) => suggestion.value,
  templates: {
    suggestion({ suggestion }) {
      return suggestion.value;
    },
  },
};

const fruits = [
  { value: 'Apple' },
  { value: 'Banana' },
  { value: 'Cherry' },
  { value: 'Orange' },
  { value: 'Pear' },
  { value: 'Pineapple' },
  { value: 'Raspberry' },
  { value: 'Strawberry' },
];

function getDefaultProps() {
  const environment = createEnvironment();

  return {
    container: environment.document.body,
    environment,
    getSources: () => [
      {
        ...defaultSource,
        getSuggestions() {
          return fruits;
        },
      },
    ],
  };
}

describe('Autocomplete', () => {
  test('should generated the correct DOM', () => {
    const props = {
      ...getDefaultProps(),
    };

    const { container } = render(<Autocomplete {...props} />);

    expect(container).toMatchSnapshot();
  });

  describe('minLength', () => {
    test.skip('should open the menu when the number of characeters is exceeded', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<Autocomplete {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );
      const dropdown = props.environment.document.body.querySelector<
        HTMLElement
      >('.algolia-autocomplete-dropdown');

      expect(dropdown).toHaveAttribute('hidden');

      userEvent.type(input, 'que');

      expect(dropdown).toHaveAttribute('hidden', 'false');
    });

    test('should not open the menu when the number of characeters is not exceeded', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { container } = render(<Autocomplete {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );
      const dropdown = props.environment.document.body.querySelector<
        HTMLElement
      >('.algolia-autocomplete-dropdown');

      input.focus();

      expect(dropdown).toHaveAttribute('hidden');
    });
  });

  describe('stalledDelay', () => {
    test.skip('should display information about the experience being stalled', () => {
      const props = {
        ...getDefaultProps(),
        stalledDelay: 0,
        getSources: () => [
          {
            ...defaultSource,
            getSuggestions() {
              return new Promise<object[]>(resolve => {
                setTimeout(() => {
                  resolve(fruits);
                }, 100);
              });
            },
          },
        ],
      };

      const { container } = render(<Autocomplete {...props} />);
      const stalledRoot = container.querySelector<HTMLElement>(
        '.algolia-autocomplete--stalled'
      );
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      userEvent.type(input, 'query');

      expect(stalledRoot).toBeInTheDocument();
    });

    test('should not display information about the experience being stalled above delay', () => {
      const props = {
        ...getDefaultProps(),
        stalledDelay: 0,
      };

      const { container } = render(<Autocomplete {...props} />);
      const stalledRoot = container.querySelector<HTMLElement>(
        '.algolia-autocomplete--stalled'
      );
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      userEvent.type(input, 'query');

      expect(stalledRoot).not.toBeInTheDocument();
    });
  });

  describe('dropdownContainer', () => {
    test.todo('defaults to `document.body`');
    test.todo('can be other HTML elements');
  });

  describe('dropdownPosition', () => {
    test.todo('defaults to `"left"`');
    test.todo('can be set to `"right"`');
  });

  describe('placeholder', () => {
    test.todo('is empty by default');
    test.todo('is forwarded to the input');
  });

  describe('defaultHighlightedIndex', () => {
    test.todo('is the first item by default');
    test.todo('can be other items');
    test.todo('can be negative to not select any items');
  });

  describe('autofocus', () => {
    test.todo('should not focus the input by default');
    test.todo('should focus the input when `true`');
  });

  describe('showCompletion', () => {
    test.todo('should be disable by default');
    test.todo('should start showing when typing');
  });

  describe('dropdownContainer', () => {
    test.todo('should be the document body by default');
    test.todo('can be any other HTML element');
    test.todo('can be any other string referencing to an HTML element');
  });

  describe('initialState', () => {
    test.todo('allows to set the initial query');
  });

  describe('keyboardShortcuts', () => {
    test('attaches keydown event to environment', () => {
      const props = {
        ...getDefaultProps(),
        keyboardShortcuts: ['/'],
      };

      const { unmount } = render(<Autocomplete {...props} />);

      expect(props.environment.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      unmount();

      expect(props.environment.removeEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    test('does not attach keydown event to environment without keyboardShortcuts', () => {
      const props = {
        ...getDefaultProps(),
      };

      const { unmount } = render(<Autocomplete {...props} />);

      expect(props.environment.addEventListener).not.toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      unmount();

      expect(props.environment.addEventListener).not.toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('onFocus', () => {
    test('is called when the input is focused', () => {
      const props = {
        ...getDefaultProps(),
        onFocus: jest.fn(),
      };

      const { container } = render(<Autocomplete {...props} />);
      const input = container.querySelector<HTMLInputElement>(
        '.algolia-autocomplete-input'
      );

      expect(props.onFocus).toHaveBeenCalledTimes(0);

      input.focus();

      expect(props.onFocus).toHaveBeenCalledTimes(1);
      expect(props.onFocus).toHaveBeenCalledWith({
        state: expect.any(Object),
        setState: expect.any(Function),
      });

      input.blur();
      input.focus();

      expect(props.onFocus).toHaveBeenCalledTimes(2);
    });
  });

  describe('onClick', () => {
    test.todo('is called when an item is cliked');
  });

  describe('onKeyDown', () => {
    test.todo('is forwarded to the input without selected item');
    test.todo('is forwarded to the input with a selected item');
  });

  describe('onError', () => {
    test.todo('is called when fetching the suggestions fails');
  });
});
