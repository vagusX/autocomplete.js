import { version } from '../version';
import { QueryParameters, Client } from 'algoliasearch';

export type SearchClient = Pick<Client, 'search' | 'searchForFacetValues'>;

interface SearchParameters {
  indexName: string;
  params: QueryParameters;
}

interface GetAlgoliaHitsOptions {
  searchClient: SearchClient;
  query: string;
  searchParameters: SearchParameters[];
}

export function getAlgoliaHits({
  searchClient,
  query,
  searchParameters,
}: GetAlgoliaHitsOptions) {
  if (typeof (searchClient as Client).addAlgoliaAgent === 'function') {
    (searchClient as Client).addAlgoliaAgent(`autocomplete.js (${version})`);
  }

  return searchClient
    .search(
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
    )
    .then(response => {
      return response.results
        .map(result => result.hits)
        .reduce((a, b) => {
          return a.concat(b);
        }, []);
    });
}
