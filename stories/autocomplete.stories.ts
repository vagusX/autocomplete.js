import { storiesOf } from '@storybook/html';
import * as algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { index, configure, hits } from 'instantsearch.js/es/widgets';

import autocomplete, {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from '../src/';

const fruits = [{ value: 'Orange' }, { value: 'Apple' }, { value: 'Banana' }];
const people = [
  { value: 'John Frusciante' },
  { value: 'John Mayer' },
  { value: 'Justin Vernon' },
];
const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const fruitSource = {
  getSuggestions({ query }) {
    return Promise.resolve(
      fruits.filter(fruit =>
        fruit.value.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      )
    );
  },
  getSuggestionValue: suggestion => suggestion.value,
  templates: {
    header: () => '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
    suggestion: fruit => fruit.value,
    empty: ({ query }) => `No fruits found for "${query}".`,
  },
};

storiesOf('Autocomplete', module)
  .add('with static values', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search…',
      },
      [
        fruitSource,
        {
          getSuggestions({ query }) {
            return Promise.resolve(
              people.filter(person =>
                person.value
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase())
              )
            );
          },
          getSuggestionValue: suggestion => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: person => person.value,
            empty: ({ query }) => `No people found for "${query}".`,
          },
        },
      ]
    );

    return container;
  })
  .add('with `minLength` set to 3', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search for a fruit (e.g. "banana")',
        minLength: 3,
      },
      [fruitSource]
    );

    return container;
  })
  .add('with `keyboardShortcuts`', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search… (focus by typing "s" or "/" in this iframe)',
        keyboardShortcuts: ['/', 's'],
      },
      [fruitSource]
    );

    return container;
  })
  .add('with `defaultHighlightedIndex`', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search… (first item is not selected by default)',
        defaultHighlightedIndex: -1,
      },
      [fruitSource]
    );

    return container;
  })
  .add('with deferred values', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search…',
      },
      [
        {
          getSuggestions({ query }) {
            return new Promise((resolve, reject) => {
              let wait = setTimeout(() => {
                clearTimeout(wait);
                resolve(
                  fruits.filter(fruit =>
                    fruit.value
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase())
                  )
                );
              }, 400);
            });
          },
          getSuggestionValue: suggestion => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
            suggestion: fruit => fruit.value,
            empty: ({ query }) => `No fruits found for "${query}".`,
          },
        },
        {
          getSuggestions({ query }) {
            return new Promise((resolve, reject) => {
              let wait = setTimeout(() => {
                clearTimeout(wait);
                resolve(
                  people.filter(person =>
                    person.value
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase())
                  )
                );
              }, 600);
            });
          },
          getSuggestionValue: suggestion => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: person => person.value,
            empty: ({ query }) => `No people found for "${query}".`,
          },
        },
      ]
    );

    return container;
  })
  .add('with deferred values but no `stalledSearchDelay`', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search (the loader spins right away)',
        stalledSearchDelay: 0,
      },
      [
        {
          getSuggestions({ query }) {
            return new Promise((resolve, reject) => {
              let wait = setTimeout(() => {
                clearTimeout(wait);
                resolve(
                  fruits.filter(fruit =>
                    fruit.value
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase())
                  )
                );
              }, 400);
            });
          },
          getSuggestionValue: suggestion => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
            suggestion: fruit => fruit.value,
            empty: ({ query }) => `No fruits found for "${query}".`,
          },
        },
        {
          getSuggestions({ query }) {
            return new Promise((resolve, reject) => {
              let wait = setTimeout(() => {
                clearTimeout(wait);
                resolve(
                  people.filter(person =>
                    person.value
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase())
                  )
                );
              }, 600);
            });
          },
          getSuggestionValue: suggestion => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: person => person.value,
            empty: ({ query }) => `No people found for "${query}".`,
          },
        },
      ]
    );

    return container;
  })
  .add('with Algolia API client', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search…',
      },
      [
        {
          getSuggestionValue: (suggestion: any) => suggestion.query,
          getSuggestions({ query }) {
            return searchClient
              .search([
                {
                  indexName: 'instant_search_demo_query_suggestions',
                  query,
                  params: {
                    hitsPerPage: 3,
                    highlightPreTag: '<mark>',
                    highlightPostTag: '</mark>',
                  },
                },
              ])
              .then(response => {
                return response.results.map(result => result.hits).flat();
              });
          },
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Suggestions</h5>',
            suggestion(suggestion) {
              return reverseHighlightAlgoliaHit({
                hit: suggestion,
                attribute: 'query',
              });
            },
          },
        },
        {
          getSuggestionValue: () => '',
          getSuggestions({ query }) {
            return searchClient
              .search([
                {
                  indexName: 'instant_search',
                  query,
                  params: {
                    hitsPerPage: 5,
                    highlightPreTag: '<mark>',
                    highlightPostTag: '</mark>',
                  },
                },
              ])
              .then(response => {
                return response.results.map(result => result.hits).flat();
              });
          },
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Products</h5>',
            suggestion(suggestion) {
              return `<a href="${suggestion.url}">${highlightAlgoliaHit({
                hit: suggestion,
                attribute: 'name',
              })}</a>`;
            },
          },
        },
      ]
    );

    return container;
  });
