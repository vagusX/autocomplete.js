import { AutocompleteOptions, AutocompleteSource } from './types';

type NormalizedAutocompleteSource = {
  [KParam in keyof AutocompleteSource]-?: AutocompleteSource[KParam];
};

function normalizeSource(
  source: AutocompleteSource
): NormalizedAutocompleteSource {
  return {
    getInputValue({ state }) {
      return state.query;
    },
    getSuggestionUrl() {
      return undefined;
    },
    onSelect({ setIsOpen }) {
      setIsOpen(false);
    },
    ...source,
  };
}

type NormalizedGetSources = (
  options: any
) => Promise<NormalizedAutocompleteSource[]>;

export function normalizeGetSources<TItem>(
  getSources: AutocompleteOptions<TItem>['getSources']
): NormalizedGetSources {
  return options => {
    return Promise.resolve(getSources(options)).then(sources =>
      Promise.all(
        sources.map(source => {
          return Promise.resolve(normalizeSource(source));
        })
      )
    );
  };
}
