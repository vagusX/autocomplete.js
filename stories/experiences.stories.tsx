/** @jsx h */

import { h } from 'preact';
import { storiesOf } from '@storybook/html';
import * as algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { index, configure } from 'instantsearch.js/es/widgets';

import { withPlayground } from '../.storybook/decorators';
import autocomplete, {
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
  snippetAlgoliaHit,
  version,
} from '../src';
import { AutocompleteApi } from '../src/types';

storiesOf('Experiences', module).add(
  'InstantSearch',
  withPlayground(({ container, dropdownContainer }) => {
    const autocompleteContainer = document.createElement('div');
    const hitsContainer = document.createElement('div');

    container.appendChild(autocompleteContainer);
    container.appendChild(hitsContainer);

    const searchClient = algoliasearch(
      'latency',
      '6be0576ff61c053d5f9a3225e2a90f76'
    );

    searchClient.addAlgoliaAgent(`autocomplete.js (${version})`);

    const search = instantsearch({
      searchClient,
      indexName: 'instant_search',
    });

    function hitsSource({ index, header, attribute }) {
      return {
        getInputValue({ state }) {
          return state.query;
        },
        getSuggestions() {
          return index.hits;
        },
        onSelect({ setIsOpen }) {
          setIsOpen(true);
        },
        templates: {
          header() {
            return (
              index.hits.length > 0 && (
                <h5 class="algolia-autocomplete-item-header">{header}</h5>
              )
            );
          },
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
                        attribute,
                      }),
                    }}
                  />

                  <p
                    style={{
                      margin: '.5rem 0 0 0',
                      color: 'rgba(0, 0, 0, 0.5)',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: snippetAlgoliaHit({
                        hit: suggestion,
                        attribute: 'description',
                      }),
                    }}
                  />
                </div>
              </a>
            );
          },
        },
      };
    }

    function querySuggestionsSource({ index, onRefine }) {
      return {
        onSelect({ suggestionValue, setIsOpen }) {
          onRefine(suggestionValue);

          setIsOpen(true);
        },
        getInputValue({ suggestion }) {
          return suggestion.query;
        },
        getSuggestions() {
          return index.hits;
        },
        templates: {
          suggestion({ suggestion }) {
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: 28,
                  }}
                >
                  <svg
                    height="13"
                    viewBox="0 0 13 13"
                    width="13"
                    style={{
                      color: 'rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <path
                      d="m16 7h-12.17l5.59-5.59-1.42-1.41-8 8 8 8 1.41-1.41-5.58-5.59h12.17z"
                      transform="matrix(.70710678 .70710678 -.70710678 .70710678 6 -5.313708)"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            );
          },
        },
      };
    }

    function getSource({ index, onRefine }) {
      switch (index.indexName) {
        case 'instant_search':
          return hitsSource({ index, header: 'Articles', attribute: 'name' });
        case 'instant_search_media':
          return hitsSource({ index, header: 'News', attribute: 'title' });
        case 'instant_search_demo_query_suggestions':
          return querySuggestionsSource({ index, onRefine });
      }
    }

    let autocompleteSearch: AutocompleteApi;

    // Object.defineProperty(autocompleteState, 'query', {
    //   get() {
    //     return '';
    //   },
    //   set(query) {
    //     autocompleteSearch.setQuery(query);
    //   },
    // });

    // Object.defineProperty(autocompleteState, 'results', {
    //   get() {
    //     return [];
    //   },
    //   set(results) {
    //     autocompleteSearch.setResults(results);
    //   },
    // });

    const autocompleteWidget = connectAutocomplete(
      (renderOptions, isFirstRender: boolean) => {
        const {
          indices,
          currentRefinement,
          refine,
          widgetParams,
          instantSearchInstance,
        } = renderOptions;

        if (isFirstRender) {
          autocompleteSearch = autocomplete({
            container: widgetParams.container,
            dropdownContainer,
            placeholder: 'Search…',
            minLength: 0,
            showCompletion: true,
            defaultHighlightedIndex: -1,
            onInput({ query, setIsOpen }) {
              setIsOpen(true);
              refine(query);
            },
            onKeyDown(event, { suggestion, setIsOpen }) {
              if (!suggestion || !suggestion.url) {
                return;
              }

              if (event.key === 'Enter') {
                if (event.metaKey || event.ctrlKey) {
                  setIsOpen(true);

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
          });
        }

        autocompleteSearch.setQuery(currentRefinement);
        autocompleteSearch.setIsStalled(instantSearchInstance._isSearchStalled);
        autocompleteSearch.setResults(
          indices.map(index => {
            return {
              source: getSource({ index, onRefine: refine }),
              suggestions: index.hits,
            };
          })
        );
      }
    );

    search.addWidgets([
      index({ indexName: 'instant_search_demo_query_suggestions' }).addWidgets([
        index({ indexName: 'instant_search' }),
        index({ indexName: 'instant_search_media' }),
        configure({
          hitsPerPage: 3,
          attributesToSnippet: ['description'],
        }),
        autocompleteWidget({
          container: autocompleteContainer,
        }),
      ]),
    ]);

    search.start();

    return container;
  })
);
