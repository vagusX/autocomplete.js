import {
  QueryParameters,
  Client,
  MultiResponse,
  Response,
} from 'algoliasearch';

import { version } from '../version';
import { flatten } from '../utils';

export type SearchClient = Pick<Client, 'search' | 'searchForFacetValues'>;

interface SearchParameters {
  indexName: string;
  query: string;
  params?: QueryParameters;
}

interface GetAlgoliaSourceOptions {
  searchClient: SearchClient;
  queries: SearchParameters[];
}

export function getAlgoliaSource({
  searchClient,
  queries,
}: GetAlgoliaSourceOptions) {
  if (typeof (searchClient as Client).addAlgoliaAgent === 'function') {
    (searchClient as Client).addAlgoliaAgent(`autocomplete.js (${version})`);
  }

  return searchClient.search(
    queries.map(searchParameters => {
      const { indexName, query, params } = searchParameters;

      return {
        indexName,
        query,
        params: {
          hitsPerPage: 5,
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          ...params,
        },
      };
    })
  );
}

export function getAlgoliaResults({
  searchClient,
  queries,
}: GetAlgoliaSourceOptions): Promise<MultiResponse['results']> {
  return getAlgoliaSource({ searchClient, queries }).then(response => {
    return response.results;
  });
}

export function getAlgoliaHits({
  searchClient,
  queries,
}: GetAlgoliaSourceOptions): Promise<Response['hits']> {
  return getAlgoliaSource({ searchClient, queries }).then(response => {
    const results = response.results;

    if (!results) {
      return [];
    }

    // @TODO: should `getAlgoliaHits` flatten the hits?
    return flatten(results.map(result => result.hits));
  });
}
