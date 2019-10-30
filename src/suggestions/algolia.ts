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
  params?: QueryParameters;
}

interface GetAlgoliaSourceOptions {
  searchClient: SearchClient;
  query: string;
  searchParameters: SearchParameters[];
}

export function getAlgoliaSource({
  searchClient,
  query,
  searchParameters,
}: GetAlgoliaSourceOptions) {
  if (typeof (searchClient as Client).addAlgoliaAgent === 'function') {
    (searchClient as Client).addAlgoliaAgent(`autocomplete.js (${version})`);
  }

  return searchClient.search(
    searchParameters.map(parameters => {
      const { indexName, params } = parameters;

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
  query,
  searchParameters,
}: GetAlgoliaSourceOptions): Promise<MultiResponse['results']> {
  return getAlgoliaSource({ searchClient, query, searchParameters }).then(
    response => {
      return response.results;
    }
  );
}

export function getAlgoliaHits({
  searchClient,
  query,
  searchParameters,
}: GetAlgoliaSourceOptions): Promise<Response['hits']> {
  return getAlgoliaSource({ searchClient, query, searchParameters }).then(
    response => {
      const results = response.results;

      if (!results) {
        return [];
      }

      return flatten(results.map(result => result.hits));
    }
  );
}
