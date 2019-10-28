/** @jsx h */

import { h } from 'preact';
import { storiesOf } from '@storybook/html';
import * as algoliasearch from 'algoliasearch';
import RecentSearches from 'recent-searches';
// import instantsearch from 'instantsearch.js';
// import { connectAutocomplete } from 'instantsearch.js/es/connectors';
// import { configure } from 'instantsearch.js/es/widgets';

import autocomplete, {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from '../src';
import { states, fruits, artists } from './data';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const querySuggestionsSource = {
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
    suggestion({ suggestion }) {
      return (
        <div style={{ display: 'flex' }}>
          <div style={{ width: 28 }}>
            <svg
              viewBox="0 0 18 18"
              width={16}
              style={{
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
          </div>

          <div
            dangerouslySetInnerHTML={{
              __html: reverseHighlightAlgoliaHit({
                hit: suggestion,
                attribute: 'query',
              }),
            }}
          />
        </div>
      );
    },
  },
};

const createSource = (items: any[], { templates = {}, limit = 10 } = {}) => ({
  getSuggestions({ query }) {
    return items
      .filter(item =>
        item.value.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      )
      .slice(0, limit);
  },
  getSuggestionValue: ({ suggestion }) => suggestion.value,
  templates: {
    suggestion: ({ suggestion }) => (
      <div style={{ display: 'flex' }}>
        {suggestion.icon && (
          <div
            style={{ width: 24 }}
            dangerouslySetInnerHTML={{ __html: suggestion.icon }}
          />
        )}
        <span>{suggestion.value}</span>
      </div>
    ),
    ...templates,
  },
});

storiesOf('Autocomplete', module)
  .add('with static values', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search for U.S. states… (e.g. "Carolina")',
      sources: [createSource(states)],
    });

    return container;
  })
  .add('with initial state', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search for U.S. states… (e.g. "Carolina")',
      initialState: {
        query: 'Carolina',
      },
      sources: [createSource(states)],
    });

    return container;
  })
  .add('with multiple sources', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder:
        'Search for states, fruits, artists… (e.g. "Carolina", "Apple", "John")',
      sources: [
        createSource(fruits, {
          limit: 5,
          templates: {
            header: ({ state }) =>
              state.results[0].length === 0
                ? ''
                : '<h5 class="algolia-autocomplete-item-header">Fruits</h5>',
          },
        }),
        createSource(artists, {
          limit: 5,
          templates: {
            header: ({ state }) =>
              state.results[1].length === 0
                ? ''
                : '<h5 class="algolia-autocomplete-item-header">Artists</h5>',
          },
        }),
        createSource(states, {
          limit: 5,
          templates: {
            header: ({ state }) =>
              state.results[2].length === 0
                ? ''
                : '<h5 class="algolia-autocomplete-item-header">States</h5>',
          },
        }),
      ],
    });

    return container;
  })
  .add('with minimal query length', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search for fruits (e.g. "apple")',
      minLength: 3,
      sources: [createSource(fruits)],
    });

    return container;
  })
  .add('with menu opening by default', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search for fruits (e.g. "banana")',
      minLength: 0,
      sources: [createSource(fruits)],
    });

    return container;
  })
  .add('with keyboard shortcuts', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search… (focus the inner window and type "/" or "a")',
      keyboardShortcuts: ['/', 'a'],
      sources: [createSource(fruits)],
    });

    return container;
  })
  .add('without default selection', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search… (first item is not selected by default)',
      defaultHighlightedIndex: -1,
      sources: [createSource(fruits)],
    });

    return container;
  })
  .add('with deferred values', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search…',
      showHint: true,
      sources: [
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
              '<h5 class="algolia-autocomplete-item-header">Fruits</h5> ',
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
                  artists.filter(artist =>
                    artist.value
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
              '<h5 class="algolia-autocomplete-item-header">artists</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No artists found for "${state.query}".`,
          },
        },
      ],
    });

    return container;
  })
  .add('with deferred values but no `stalledDelay`', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search (the loader spins right away)',
      stalledDelay: 0,
      sources: [
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
                  artists.filter(artist =>
                    artist.value
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
              '<h5 class="algolia-autocomplete-item-header">artists</h5>',
            suggestion: ({ suggestion }) => suggestion.value,
            empty: ({ state }) => `No artists found for "${state.query}".`,
          },
        },
      ],
    });

    return container;
  })
  .add('with hint', () => {
    const container = document.createElement('div');

    autocomplete({
      container,
      placeholder: 'Search…',
      showHint: true,
      sources: [querySuggestionsSource],
    });

    return container;
  })
  .add('with RTL', () => {
    const container = document.createElement('div');
    container.dir = 'rtl';

    autocomplete({
      container,
      placeholder: 'Search…',
      sources: [querySuggestionsSource],
    });

    return container;
  })
  .add('with recent searches', () => {
    const container = document.createElement('div');

    const recentSearches = new RecentSearches({
      limit: 3,
    });

    autocomplete({
      container,
      placeholder: 'Search…',
      showHint: true,
      minLength: 0,
      onSelect({ state }) {
        recentSearches.setRecentSearch(state.query.trim());
      },
      sources: [
        {
          key: 'history',
          getSuggestionValue: ({ suggestion }) => suggestion.query + ' ',
          getSuggestions({ query }) {
            if (query) {
              return [];
            }

            // Also inject some fake searches for the demo
            return [
              ...recentSearches.getRecentSearches(),
              { query: 'guitar' },
              { query: 'amazon' },
            ].slice(0, 3);
          },
          templates: {
            suggestion({ suggestion }) {
              return (
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 28 }}>
                    <img
                      src="https://image.flaticon.com/icons/svg/61/61122.svg"
                      width="16"
                      height="16"
                      style={{
                        opacity: 0.3,
                      }}
                    />
                  </div>

                  {suggestion.query}
                </div>
              );
            },
          },
        },
        querySuggestionsSource,
      ],
    });

    return container;
  })
  .add('with hits', () => {
    const container = document.createElement('div');

    const recentSearches = new RecentSearches({
      limit: 3,
    });

    autocomplete({
      container,
      placeholder: 'Search…',
      minLength: 0,
      showHint: true,
      defaultHighlightedIndex: -1,
      onClick({ event, setState }) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
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
          recentSearches.setRecentSearch(state.query);

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
          recentSearches.setRecentSearch(state.query);
        }
      },
      sources: [
        {
          key: 'history',
          getSuggestionValue: ({ suggestion }) => suggestion.query + ' ',
          getSuggestions({ query }) {
            if (query) {
              return [];
            }

            return recentSearches.getRecentSearches();
          },
          templates: {
            suggestion({ suggestion }) {
              return (
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 28 }}>
                    <img
                      src="https://image.flaticon.com/icons/svg/61/61122.svg"
                      width="16"
                      height="16"
                      style={{
                        opacity: 0.3,
                      }}
                    />
                  </div>

                  {suggestion.query}
                </div>
              );
            },
          },
        },
        querySuggestionsSource,
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
                        // @TODO: add same highlight function for snippets
                        __html: suggestion._snippetResult.description.value,
                      }}
                    />
                  </div>
                </a>
              );
            },
          },
        },
      ],
    });

    return container;
  });
// .add('with InstantSearch', () => {
//   const container = document.createElement('div');
//   const autocompleteContainer = document.createElement('div');
//   const hitsContainer = document.createElement('div');

//   container.appendChild(autocompleteContainer);
//   container.appendChild(hitsContainer);

//   const search = instantsearch({
//     searchClient,
//     indexName: 'instant_search',
//   });
//   const autocompleteState = {};

//   const autocompleteWidget = connectAutocomplete(
//     (renderOptions, isFirstRender) => {
//       const {
//         indices,
//         refine,
//         widgetParams,
//         instantSearchInstance,
//       } = renderOptions;

//       console.log(instantSearchInstance);

//       autocompleteState.hits = indices.map(index => index.hits).flat();

//       if (isFirstRender) {
//         autocomplete({
//           container: widgetParams.container,
//           placeholder: 'Search…',
//           onSelect: ({ suggestionValue }) => refine(suggestionValue),
//           sources: [
//             {
//               getSuggestionValue: ({ suggestion }) => suggestion.name,
//               getSuggestions({ query }) {
//                 refine(query);

//                 // @TODO: this value is coming from the previous state
//                 return autocompleteState.hits;
//               },
//               templates: {
//                 header: () =>
//                   '<h5 class="algolia-autocomplete-item-header">E-commerce</h5>',
//                 suggestion({ suggestion }) {
//                   return highlightAlgoliaHit({
//                     hit: suggestion,
//                     attribute: 'name',
//                   });
//                 },
//               },
//             },
//           ],
//         });
//       }
//     }
//   );

//   search.addWidgets([
//     configure({
//       hitsPerPage: 5,
//     }),
//     autocompleteWidget({
//       container: autocompleteContainer,
//     }),
//   ]);

//   search.start();

//   return container;
// });
