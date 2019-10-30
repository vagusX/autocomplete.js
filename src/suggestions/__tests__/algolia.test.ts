import { version } from '../../version';
import {
  getAlgoliaSource,
  getAlgoliaResults,
  getAlgoliaHits,
} from '../algolia';
import { Response } from 'algoliasearch';

function createSearchClient() {
  return {
    search: jest.fn(() =>
      Promise.resolve({
        results: [
          {
            hits: [{ value: '1' }, { value: '2' }, { value: '3' }],
            nbHits: 3,
          } as Response,
          {
            hits: [{ value: '1 (bis)' }, { value: '2 (bis)' }],
            nbHits: 2,
          } as Response,
        ],
      })
    ),
    searchForFacetValues: jest.fn(),
    addAlgoliaAgent: jest.fn(),
  };
}

describe('algolia suggestions', () => {
  describe('getAlgoliaSource', () => {
    test('adds the user agent', () => {
      const searchClient = createSearchClient();

      getAlgoliaSource({
        searchClient,
        query: 'query',
        searchParameters: [
          {
            indexName: 'indexName',
          },
        ],
      });

      expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
        `autocomplete.js (${version})`
      );
    });

    test('searches with the correct parameters', () => {
      const searchClient = createSearchClient();

      getAlgoliaSource({
        searchClient,
        query: 'query',
        searchParameters: [
          {
            indexName: 'indexName',
            params: {
              filters: 'lang:en',
            },
          },
          {
            indexName: 'indexName',
            params: {
              filters: 'lang:fr',
            },
          },
        ],
      });

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          query: 'query',
          params: {
            hitsPerPage: 5,
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            filters: 'lang:en',
          },
        },
        {
          indexName: 'indexName',
          query: 'query',
          params: {
            hitsPerPage: 5,
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            filters: 'lang:fr',
          },
        },
      ]);
    });
  });

  describe('getAlgoliaResults', () => {
    test('returns the results from all indices', async () => {
      const searchClient = createSearchClient();
      const results = await getAlgoliaResults({
        searchClient,
        query: 'query',
        searchParameters: [{ indexName: 'indexName' }],
      });

      expect(results).toHaveLength(2);
    });
  });

  describe('getAlgoliaHits', () => {
    test('returns the flattened hits from all indices', async () => {
      const searchClient = createSearchClient();
      const hits = await getAlgoliaHits({
        searchClient,
        query: 'query',
        searchParameters: [{ indexName: 'indexName' }],
      });

      expect(hits).toHaveLength(5);
    });
  });
});
