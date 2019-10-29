import {
  QueryParameters,
  Client,
  MultiResponse,
  Response,
} from 'algoliasearch';

import { version } from '../version';

export type SearchClient = Pick<Client, 'search' | 'searchForFacetValues'>;

interface SearchParameters {
  indexName: string;
  params: QueryParameters;
}

interface GetAlgoliaSourceOptions {
  searchClient: SearchClient;
  query: string;
  searchParameters: SearchParameters[];
}

interface GetAlgoliaHitsOptions extends GetAlgoliaSourceOptions {
  transformItems?(items: Response['hits']): any;
}

interface GetAlgoliaResultsOptions extends GetAlgoliaSourceOptions {
  transformItems?(items: MultiResponse['results']): any;
}

function getAlgoliaSource({
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

export function getAlgoliaHits({
  searchClient,
  query,
  searchParameters,
  transformItems = x => x,
}: GetAlgoliaHitsOptions): Promise<Response['hits']> {
  return getAlgoliaSource({ searchClient, query, searchParameters }).then(
    response => {
      const results = response.results;

      if (!results) {
        return transformItems!([]);
      }

      return transformItems!(
        results
          .map(result => result.hits)
          .reduce((a, b) => {
            return a.concat(b);
          }, [])
      );
    }
  );
}

export function getAlgoliaResults({
  searchClient,
  query,
  searchParameters,
  transformItems = x => x,
}: GetAlgoliaResultsOptions): Promise<MultiResponse['results']> {
  return getAlgoliaSource({ searchClient, query, searchParameters }).then(
    response => {
      return transformItems!(response.results);
    }
  );
}
