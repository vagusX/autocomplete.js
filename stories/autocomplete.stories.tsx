/** @jsx h */

import { h } from 'preact';
import { storiesOf } from '@storybook/html';
import * as algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import RecentSearches from 'recent-searches';
import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { configure } from 'instantsearch.js/es/widgets';

import autocomplete, {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from '../src';

type FruitSource = Array<{ value: string }>;
const fruits: FruitSource = [
  { value: 'Orange' },
  { value: 'Apple' },
  { value: 'Banana' },
];
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
    return fruits.filter(fruit =>
      fruit.value.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  },
  getSuggestionValue: ({ suggestion }) => suggestion.value,
  templates: {
    header: () => '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
    suggestion: ({ suggestion }) => suggestion.value,
    empty: ({ state }) => `No fruits found for "${state.query}".`,
  },
};

storiesOf('Autocomplete', module)
  .add('with static values', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search…',
        showHint: true,
      },
      [
        fruitSource,
        {
          getSuggestions({ query }) {
            return people.filter(person =>
              person.value
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase())
            );
          },
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No people found for "${state.query}".`,
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
  .add('with menu that opens by default', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search for a fruit (e.g. "banana")',
        minLength: 0,
      },
      [
        {
          getSuggestions({ query }) {
            if (!query) {
              return fruits;
            }

            return fruits.filter(fruit =>
              fruit.value
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase())
            );
          },
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No fruits found for "${state.query}".`,
          },
        },
      ]
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
        showHint: true,
      },
      [
        {
          getSuggestions({ query }) {
            return new Promise(resolve => {
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
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: ({ state }) =>
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5> ' +
              state.error,
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) =>
              `No fruits found for "${state.query}". ${state.error}`,
          },
        },
        {
          getSuggestions({ query }) {
            return new Promise(resolve => {
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
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No people found for "${state.query}".`,
          },
        },
      ]
    );

    return container;
  })
  .add('with deferred values but no `stalledDelay`', () => {
    const container = document.createElement('div');

    autocomplete(
      {
        container,
        placeholder: 'Search (the loader spins right away)',
        stalledDelay: 0,
      },
      [
        {
          getSuggestions({ query }) {
            return new Promise(resolve => {
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
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No fruits found for "${state.query}".`,
          },
        },
        {
          getSuggestions({ query }) {
            return new Promise(resolve => {
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
          getSuggestionValue: ({ suggestion }) => suggestion.value,
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">People</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No people found for "${state.query}".`,
          },
        },
      ]
    );

    return container;
  })
  .add('with Query Suggestions', () => {
    const container = document.createElement('div');

    const searches = new RecentSearches({
      limit: 3,
    });

    autocomplete(
      {
        container,
        placeholder: 'Search…',
        minLength: 0,
        showHint: true,
        defaultHighlightedIndex: -1,
        onClick({ event, setState }) {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            setState({
              isOpen: true,
            });
          } else {
            setState({
              isOpen: false,
            });
          }
        },
        onKeyDown({ event, suggestion, state, setState }) {
          if (!suggestion.url) {
            return;
          }

          if (event.key === 'Enter') {
            searches.setRecentSearch(state.query);

            if (event.metaKey || event.ctrlKey) {
              setState({
                isOpen: true,
              });

              const windowReference = window.open(suggestion.url, '_blank');
              windowReference!.focus();
            } else if (event.shiftKey) {
              window.open(suggestion.url, '_blank');
            } else if (event.altKey) {
            } else {
              window.location.assign(suggestion.url);
            }
          }
        },
        onSelect({ source, state, setState }) {
          if (['history', 'suggestion'].includes(source.key!)) {
            setState({
              isOpen: true,
            });
          } else {
            searches.setRecentSearch(state.query);
          }
        },
      },
      [
        {
          key: 'history',
          getSuggestionValue: ({ suggestion }) => suggestion.query + ' ',
          getSuggestions({ query }) {
            if (query) {
              return [];
            }

            return searches.getRecentSearches();
          },
          templates: {
            suggestion({ suggestion }) {
              return (
                <div style={{ display: 'flex' }}>
                  <img
                    src="https://image.flaticon.com/icons/svg/61/61122.svg"
                    width="16"
                    height="16"
                    style={{
                      marginRight: '.6rem',
                      opacity: 0.3,
                    }}
                  />

                  {suggestion.query}
                </div>
              );
            },
          },
        },
        {
          key: 'suggestion',
          getSuggestionValue: ({ suggestion }) => suggestion.query + ' ',
          getSuggestions({ query }) {
            return searchClient
              .search([
                {
                  indexName: 'instant_search_demo_query_suggestions',
                  query,
                  params: {
                    hitsPerPage: 4,
                    highlightPreTag: '<mark>',
                    highlightPostTag: '</mark>',
                  },
                },
              ])
              .then(response => {
                return response.results
                  .map(result => result.hits)
                  .flat()
                  .filter(
                    suggestion =>
                      suggestion.query !== query.toLocaleLowerCase() &&
                      `${suggestion.query} ` !== query.toLocaleLowerCase()
                  )
                  .slice(0, 3);
              });
          },
          templates: {
            suggestion({ suggestion, state }) {
              return (
                <div style={{ display: 'flex' }}>
                  <svg
                    viewBox="0 0 18 18"
                    width={16}
                    style={{
                      marginRight: '.6rem',
                      color: 'rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <path
                      d="M13.14 13.14L17 17l-3.86-3.86A7.11 7.11 0 1 1 3.08 3.08a7.11 7.11 0 0 1 10.06 10.06z"
                      stroke="currentColor"
                      stroke-width="1.78"
                      fill="none"
                      fill-rule="evenodd"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>

                  {state.query ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: reverseHighlightAlgoliaHit({
                          hit: suggestion,
                          attribute: 'query',
                        }),
                      }}
                    />
                  ) : (
                    <div>{suggestion.query}</div>
                  )}
                </div>
              );
            },
          },
        },
        {
          key: 'products',
          getSuggestionValue: ({ state }) => state.query,
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
                    attributesToSnippet: ['description'],
                  },
                },
              ])
              .then(response => {
                const results = response.results
                  .map(result => result.hits)
                  .flat();

                return results;
              });
          },
          templates: {
            header: () =>
              '<h5 class="algolia-autocomplete-item-header">Products</h5>',
            suggestion({ suggestion }) {
              return (
                <a
                  href={suggestion.url}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div
                    style={{
                      flex: 1,
                      maxWidth: 70,
                      maxHeight: 70,
                      paddingRight: '1rem',
                    }}
                  >
                    <img
                      src={suggestion.image}
                      alt={suggestion.name}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>

                  <div style={{ flex: 3 }}>
                    <h2
                      style={{ fontSize: 'inherit', margin: 0 }}
                      dangerouslySetInnerHTML={{
                        __html: highlightAlgoliaHit({
                          hit: suggestion,
                          attribute: 'name',
                        }),
                      }}
                    />

                    <p
                      style={{
                        margin: '.5rem 0 0 0',
                        color: 'rgba(0, 0, 0, 0.5)',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: suggestion._snippetResult.description.value,
                      }}
                    />
                  </div>
                </a>
              );
            },
          },
        },
      ]
    );

    return container;
  })
  .add('with InstantSearch', () => {
    const container = document.createElement('div');
    const autocompleteContainer = document.createElement('div');
    const hitsContainer = document.createElement('div');

    container.appendChild(autocompleteContainer);
    container.appendChild(hitsContainer);

    const search = instantsearch({
      searchClient,
      indexName: 'instant_search',
    });

    const autocompleteWidget = connectAutocomplete(
      (renderOptions, isFirstRender) => {
        console.log(renderOptions);

        const {
          currentRefinement,
          indices,
          refine,
          widgetParams,
        } = renderOptions;

        const hits = indices.map(index => index.hits).flat();

        autocomplete(
          {
            container: widgetParams.container,
            placeholder: 'Search…',
            onSelect: ({ suggestionValue }) => refine(suggestionValue),
          },
          [
            {
              templates: {
                suggestion({ suggestion }) {
                  return suggestion._highlightResult.name.value;
                },
                header: () =>
                  '<h5 class="algolia-autocomplete-item-header">E-commerce</h5>',
              },
              getSuggestionValue(suggestion) {
                return suggestion.name;
              },
              getSuggestions({ query }) {
                // refine(query);
                return hits;
              },
            },
          ]
        );
      }
    );

    search.addWidgets([
      configure({
        hitsPerPage: 5,
      }),
      autocompleteWidget({
        container: autocompleteContainer,
      }),
    ]);

    search.start();

    return container;
  });
