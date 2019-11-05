# Autocomplete.js

<p align="center">

Autocomplete.js is a JavaScript library that creates a fast and fully-featured auto-completion experience.

</p>

---

[![Version](https://img.shields.io/npm/v/autocomplete.js.svg?style=flat-square)](https://www.npmjs.com/package/autocomplete.js) [![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/autocomplete.js/badge?style=flat-square)](https://www.jsdelivr.com/package/npm/autocomplete.js) [![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## Features

- Displays suggestions as you type
- Shows top suggestion as a completion
- Supports custom templates for UI flexibility
- Works well with RTL languages
- Triggers custom hooks to plug your logic
- Plugs easily to Algolia's realtime search engine

## Usage

> [Try it out live](https://codesandbox.io/s/github/algolia/create-instantsearch-app/tree/templates/autocomplete.js)

###### HTML

```html
<body>
  <div id="autocomplete"></div>
</body>
```

###### JavaScript

```js
const items = [
  { value: 'Apple', count: 120 },
  { value: 'Banana', count: 100 },
  { value: 'Cherry', count: 50 },
  { value: 'Orange', count: 150 },
];

autocomplete({
  container: '#autocomplete',
  getSources() {
    return [
      {
        getSuggestions({ query }) {
          return items.filter(item =>
            item.value.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          );
        },
        getSuggestionValue({ suggestion }) {
          return suggestion.value;
        },
        templates: {
          suggestion({ suggestion }) {
            return `<div>${suggestion.value} (${suggestion.count})</div>`;
          },
        },
      },
    ];
  },
});
```

## Installation

**🚧 This version of Autocomplete.js is not yet published.**

Autocomplete.js is available on the [npm](https://www.npmjs.com/) registry.

```sh
yarn add autocomplete.js
# or
npm install autocomplete.js
```

If you do not wish to use a package manager, you can use standalone endpoints:

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/autocomplete.js/1"></script>

<!-- unpkg -->
<script src="https://unpkg.com/autocomplete.js/1"></script>
```

## API

### Options

**🚧 This version of Autocomplete.js is in development.** You can temporarily refer to the [TypeScript definitions](https://github.com/francoischalifour/autocomplete.js/blob/next/src/Autocomplete.tsx) for full options description.

#### `container`

> `string | HTMLElement` | **required**

The container for the autocomplete search box.

#### `getSources`

> `(options: { query: string }) => Source[]` | **required**

Called to fetch the [sources](#sources).

#### `dropdownContainer`

> `string | HTMLElement` | defaults to `document.body`

The container for the autocomplete dropdown.

#### `dropdownPosition`

> `'left' | 'right'` | defaults to `'left'`

The dropdown position related to the container.

#### `placeholder`

> `string` | defaults to `""`

The text that appears in the search box input when there is no query.

It is fowarded to the [`input`'s placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefplaceholder).

#### `showCompletion`

> `boolean` | defaults to `false`

Whether to show the highlighted suggestion as completion in the input.

![`showCompletion` preview](https://user-images.githubusercontent.com/6137112/68124812-7e989800-ff10-11e9-88a5-f28c1466b665.png)

#### `minLength`

> `number` | defaults to `1`

The minimum number of characters long the autocomplete opens.

#### `autofocus`

> `boolean` | defaults to `false`

Whether to focus the search box when the page is loaded.

#### `keyboardShortcuts`

> `string[]`

The keyboard shortcuts keys to focus the input.

#### `defaultHighlightedIndex`

> `number` | defaults to `0` (the first item)

The default item index to pre-select.

#### `stallThreshold`

> `number` | defaults to `300`

The number of milliseconds that must elapse before the autocomplete experience is stalled. The timeout is set from the moment [`getSources`](#getsources) is called.

When the experience is stalled:

- The CSS class `algolia-autocomplete--stalled` is added to the autocomplete container
- The `isStalled` boolean is `true` in the [state](#state)

#### `initialState`

> [`State`](#state)

The initial state to apply when the page is loaded.

#### `templates`

> [`GlobalTemplates`](#global-templates)

Refer to the "[Global Templates](#global-templates)" section.

#### `environment`

> `typeof window` | defaults to `window`

The environment from where your JavaScript is running.

Useful if you're using Autocomplete.js in a different context than [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window).

#### `onFocus`

> `(options) => void`

Called when the input is focused.

This function is also called when the input is clicked while already having the focus _and_ the dropdown is closed.

#### `onError`

> `(options) => void` | defaults to `({ state }) => throw state.error`

Called when an error is thrown while getting the suggestions.

When an error is caught:

- The error is thrown (default `onError` implementation)
- The CSS class `algolia-autocomplete--errored` is added to the autocomplete container
- The error is available in the [state](#state)

#### `onClick`

> `(event: MouseEvent, options) => void`

Called when a [`click` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) is fired on an item.

This function is useful to alter the behavior when a special key is held (e.g. keeping the dropdown open when the meta key is used).

#### `onKeyDown`

> `(event: KeyboardEvent, options) => void`

Called when a [`keydown` event](https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event) is fired.

This function is useful to alter the behavior when a special key is held.

<details>

<summary>Example</summary>

```js
onKeyDown(event, { suggestion, state, setState }) {
  if (!suggestion || !suggestion.url) {
    return;
  }

  if (event.key === 'Enter') {
    if (event.metaKey || event.ctrlKey) {
      setState({
        isOpen: true,
      });

      const windowReference = window.open(suggestion.url, '_blank');
      windowReference.focus();
    } else if (event.shiftKey) {
      window.open(suggestion.url, '_blank');
    } else if (event.altKey) {
    } else {
      window.location.assign(suggestion.url);
    }
  }
}
```

</details>

#### `onEmpty`

> `(options) => void`

Called when there are no results.

#### `onInput`

> `(options) => void`

Called when the input changes.

### Sources

An Autocomplete source refers to an object with the following properties:

#### `getSuggestionValue`

> `(options: { suggestion: Suggestion, state: State }) => string`

Called to get the value of the suggestion. The value is used to fill the search box.

If you do not wish to update the input value when an item is selected, you can return `state.query`.

<details>
  <summary>Example</summary>

```js
const items = [{ value: 'Apple' }, { value: 'Banana' }];

const source = {
  getSuggestionValue: ({ suggestion }) => suggestion.value,
  // ...
};
```

</details>

#### `getSuggestions`

> `(options: { query }) => Suggestion[]` | **required**

Called when the input changes. You can use this function to filter/search the items based on the query.

<details>
  <summary>Example</summary>

```js
const items = [{ value: 'Apple' }, { value: 'Banana' }];

const source = {
  getSuggestions({ query }) {
    return items.filter(item => item.value.includes(query));
  },
  // ...
};
```

</details>

#### `templates`

> **required**

Templates to use for the source. A template supports strings and JSX elements.

##### `header`

> `(options: { state: State }) => string | JSX.Element`

The template to display before the suggestions.

##### `suggestion`

> `(options: { suggestion: Suggestion, state: State }) => string | JSX.Element`

The template for each suggestion.

##### `footer`

> `(options: { state: State }) => string | JSX.Element`

The template to display after the suggestions.

##### `empty`

> `(options: { state: State }) => string | JSX.Element`

The template to display when there are no suggestions.

<details>
  <summary>Example</summary>

**Using strings**

```js
const items = [{ value: 'Apple' }, { value: 'Banana' }];

const source = {
  templates: {
    header() {
      return '<h2>Fruits</h2>';
    },
    suggestion({ suggestion }) {
      return suggestion.value;
    },
    footer() {
      return '<a href="/fruits">See more</a>';
    },
  },
  // ...
};
```

**Using JSX elements**

```jsx
const items = [{ value: 'Apple' }, { value: 'Banana' }];

const source = {
  templates: {
    header() {
      return <h2>Fruits</h2>;
    },
    suggestion({ suggestion }) {
      return suggestion.value;
    },
    footer() {
      return <a href="/fruits">See more</a>;
    },
  },
  // ...
};
```

</details>

#### `onSelect`

> `(options) => void`

Called when an item is selected.

### State

The Autocomplete.js state drives the behavior. It can be initially set with [`initialState`](#initial-state) and it's is passed to all templates.

#### `query`

> `string` | defaults to `''`

The query.

#### `results`

> `Array<Suggestion[]>` | defaults to `[]`

The results of all the sources.

#### `isOpen`

> `boolean` | defaults to `false`

Whether the dropdown is open.

#### `isLoading`

> `boolean` | defaults to `false`

Whether the experience is loading.

#### `isStalled`

> `boolean` | defaults to `false`

Whether the experience is stalled.

#### `error`

> `null | Error` | defaults to `null`

The error that happened, `null` if none.

### Global templates

In addition to the source templates, Autocomplete.js supports some global templates.

#### `header`

> `(options: { state: State }) => string | JSX.Element`

The template to display before all sources.

#### `footer`

> `(options: { state: State }) => string | JSX.Element`

The template to display after all sources.

## Design

<!-- TODO -->

## Presets

Autocomplete.js comes with presets to facilitate the integration with [Algolia](http://algolia.com/).

### `getAlgoliaHits`

> `(options: { searchClient: SearchClient, query: string, searchParameters: SearchParameters[] }) => Promise<Response['hits']>`

Function that retrieves and merges Algolia hits from multiple indices.

This function comes with default Algolia search parameters:

- [`hitsPerPage`](https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/): `5`
- [`highlightPreTag`](https://www.algolia.com/doc/api-reference/api-parameters/highlightPreTag/): `<mark>`
- [`highlightPostTag`](https://www.algolia.com/doc/api-reference/api-parameters/highlightPostTag/): `</mark>`

<details>
  <summary>Example</summary>

```js
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

autocomplete({
  // ...
  getSources({ query }) {
    return [
      {
        // ...
        getSuggestions({ query }) {
          return getAlgoliaHits({
            searchClient,
            query,
            searchParameters: [
              {
                indexName: 'instant_search',
                params: {
                  hitsPerPage: 3,
                },
              },
            ],
          });
        },
      },
    ];
  },
});
```

</details>

### `getAlgoliaResults`

> `(options: { searchClient: SearchClient, query: string, searchParameters: SearchParameters[] }) => Promise<MultiResponse['results']>`

Function that retrieves Algolia results from multiple indices.

This function comes with default Algolia search parameters:

- [`hitsPerPage`](https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/): `5`
- [`highlightPreTag`](https://www.algolia.com/doc/api-reference/api-parameters/highlightPreTag/): `<mark>`
- [`highlightPostTag`](https://www.algolia.com/doc/api-reference/api-parameters/highlightPostTag/): `</mark>`

<details>
  <summary>Example</summary>

```js
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

autocomplete({
  // ...
  getSources({ query }) {
    return [
      {
        // ...
        getSuggestions({ query }) {
          return getAlgoliaResults({
            searchClient,
            query,
            searchParameters: [
              {
                indexName: 'instant_search',
                params: {
                  hitsPerPage: 3,
                },
              },
            ],
          }).then(results => {
            const firstResult = results[0];

            return firstResult.hits;
          });
        },
      },
    ];
  },
});
```

</details>

### `highlightAlgoliaHit`

Highlights and escapes the value of a record.

<details>

<summary>Example</summary>

```js
autocomplete({
  // ...
  templates: {
    suggestion({ suggestion }) {
      return highlightAlgoliaHit({
        hit: suggestion,
        attribute: 'name',
      });
    },
  },
});
```

</details>

### `reverseHighlightAlgoliaHit`

This function reverse-highlights and escapes the value of a record.

It's useful when following the pattern of [Query Suggestions](https://www.algolia.com/doc/guides/getting-insights-and-analytics/leveraging-analytics-data/query-suggestions/) to highlight the difference between what the user types and the suggestion shown.

<details>

<summary>Example</summary>

```js
autocomplete({
  // ...
  templates: {
    suggestion({ suggestion }) {
      return reverseHighlightAlgoliaHit({
        hit: suggestion,
        attribute: 'query',
      });
    },
  },
});
```

</details>

## Examples

<!-- TODO -->

## Browser support

<!-- TODO -->

## Contributing

Please refer to the [contributing guide](CONTRIBUTING.md).

## License

Autocomplete.js is [MIT licensed](LICENSE).

<!--

# v0 documentation

## Datasets

An autocomplete is composed of one or more datasets. When an end-user modifies the value of the underlying input, each dataset will attempt to render suggestions for the new value.

Datasets can be configured using the following options.

- `source` – The backing data source for suggestions. Expected to be a function with the signature `(query, cb)`. It is expected that the function will compute the suggestion set (i.e. an array of JavaScript objects) for `query` and then invoke `cb` with said set. `cb` can be invoked synchronously or asynchronously.

- `name` – The name of the dataset. This will be appended to `tt-dataset-` to form the class name of the containing DOM element. Must only consist of underscores, dashes, letters (`a-z`), and numbers. Defaults to a random number.

- `displayKey` – For a given suggestion object, determines the string representation of it. This will be used when setting the value of the input control after a suggestion is selected. Can be either a key string or a function that transforms a suggestion object into a string. Defaults to `value`. Example function usage: `displayKey: function(suggestion) { return suggestion.nickname || suggestion.firstName }`

- `templates` – A hash of templates to be used when rendering the dataset. Note a precompiled template is a function that takes a JavaScript object as its first argument and returns a HTML string.

  - `empty` – Rendered when `0` suggestions are available for the given query. Can be either a HTML string or a precompiled template. The templating function is called with a context containing `query`, `isEmpty`, and any optional arguments that may have been forwarded by the source: `function emptyTemplate({ query, isEmpty }, [forwarded args])`.

  - `footer` – Rendered at the bottom of the dataset. Can be either a HTML string or a precompiled template. The templating function is called with a context containing `query`, `isEmpty`, and any optional arguments that may have been forwarded by the source: `function footerTemplate({ query, isEmpty }, [forwarded args])`.

  - `header` – Rendered at the top of the dataset. Can be either a HTML string or a precompiled template. The templating function is called with a context containing `query`, `isEmpty`, and any optional arguments that may have been forwarded by the source: `function headerTemplate({ query, isEmpty }, [forwarded args])`.

  - `suggestion` – Used to render a single suggestion. The templating function is called with the `suggestion`, and any optional arguments that may have been forwarded by the source: `function suggestionTemplate(suggestion, [forwarded args])`. Defaults to the value of `displayKey` wrapped in a `p` tag i.e. `<p>{{value}}</p>`.

- `debounce` – If set, will postpone the source execution until after `debounce` milliseconds have elapsed since the last time it was invoked.

- `cache` - If set to `false`, subsequent identical queries will always execute the source function for suggestions. Defaults to `true`.

## Sources

A few helpers are provided by default to ease the creation of Algolia-based sources.

### Hits

To build a source based on Algolia's `hits` array, just use:

```js
{
  source: autocomplete.sources.hits(indexObj, { hitsPerPage: 2 }),
  templates: {
    suggestion: function(suggestion, answer) {
      // FIXME
    }
  }
}
```

### PopularIn (aka "xxxxx in yyyyy")

To build an Amazon-like autocomplete menu, suggesting popular queries and for the most popular one displaying the associated categories, you can use the `popularIn` source:

```js
{
  source: autocomplete.sources.popularIn(popularQueriesIndexObj, { hitsPerPage: 3 }, {
    source: 'sourceAttribute',           // attribute of the `popularQueries` index use to query the `index` index
    index: productsIndexObj,             // targeted index
    facets: 'facetedCategoryAttribute',  // facet used to enrich the most popular query
    maxValuesPerFacet: 3                 // maximum number of facets returned
  }, {
    includeAll: true,                    // should it include an extra "All department" suggestion
    allTitle: 'All departments'          // the included category label
  }),
  templates: {
    suggestion: function(suggestion, answer) {
      var value = suggestion.sourceAttribute;
      if (suggestion.facet) {
        // this is the first suggestion
        // and it has been enriched with the matching facet
        value += ' in ' + suggestion.facet.value + ' (' + suggestion.facet.count + ')';
      }
      return value;
    }
  }
}
```

### Custom source

The `source` options can also take a function. It enables you to have more control of the results returned by Algolia search. The function `function(query, callback)` takes 2 parameters

- `query: String`: the text typed in the autocomplete
- `callback: Function`: the callback to call at the end of your processing with the array of suggestions

```js
source: function(query, callback) {
  var index = client.initIndex('myindex');
  index.search(query, { hitsPerPage: 1, facetFilters: 'category:mycat' }).then(function(answer) {
    callback(answer.hits);
  }, function() {
    callback([]);
  });
}
```

Or by reusing an existing source:

```js
var hitsSource = autocomplete.sources.hits(index, { hitsPerPage: 5 });

source: function(query, callback) {
  hitsSource(query, function(suggestions) {
    // FIXME: Do stuff with the array of returned suggestions
    callback(suggestions);
  });
}
```

## Security

### User-generated data: protecting against XSS

Malicious users may attempt to engineer XSS attacks by storing HTML/JS in their data. It is important that user-generated data be properly escaped before using it in an _autocomplete.js_ template.

In order to easily do that, _autocomplete.js_ provides you with a helper function escaping all HTML code but the highlighting tags:

```js
  templates: {
    suggestion: function(suggestion) {
      var val = suggestion._highlightResult.name.value;
      return autocomplete.escapeHighlightedString(val);
    }
  }
```

If you did specify custom highlighting pre/post tags, you can specify them as 2nd and 3rd parameter:

```js
  templates: {
    suggestion: function(suggestion) {
      var val = suggestion._highlightResult.name.value;
      return autocomplete.escapeHighlightedString(val, '<span class="highlighted">', '</span>');
    }
  }
```

## FAQ

### How can I `Control`-click on results and have them open in a new tab?

You'll need to update your suggestion templates to make them as `<a href>` links and not simple divs. `Control`-clicking on them will trigger the default browser behavior and open suggestions in a new tab.

To also support keyboard navigation, you'll need to listen to the `autocomplete:selected` event and change `window.location` to the destination URL.

Note that you might need to check the value of `context.selectionMethod` in `autocomplete:selected` first. If it's equal to `click`, you should `return` early, otherwise your main window will **also** follow the link.

Here is an example of how it would look like:

```javascript
autocomplete(…).on('autocomplete:selected', function(event, suggestion, dataset, context) {
  // Do nothing on click, as the browser will already do it
  if (context.selectionMethod === 'click') {
    return;
  }
  // Change the page, for example, on other events
  window.location.assign(suggestion.url);
});
```

## Events

The autocomplete component triggers the following custom events.

- `autocomplete:opened` – Triggered when the dropdown menu of the autocomplete is opened.

- `autocomplete:shown` – Triggered when the dropdown menu of the autocomplete is shown (opened and non-empty).

- `autocomplete:empty` – Triggered when all datasets are empty.

- `autocomplete:closed` – Triggered when the dropdown menu of the autocomplete is closed.

- `autocomplete:updated` – Triggered when a dataset is rendered.

- `autocomplete:cursorchanged` – Triggered when the dropdown menu cursor is moved to a different suggestion. The event handler will be invoked with 3 arguments: the jQuery event object, the suggestion object, and the name of the dataset the suggestion belongs to.

- `autocomplete:selected` – Triggered when a suggestion from the dropdown menu is selected. The event handler will be invoked with the following arguments: the jQuery event object, the suggestion object, the name of the dataset the suggestion belongs to and a `context` object. The `context` contains a `.selectionMethod` key that can be either `click`, `enterKey`, `tabKey` or `blur`, depending how the suggestion was selected.

- `autocomplete:cursorremoved` – Triggered when the cursor leaves the selections or its current index is lower than 0

- `autocomplete:autocompleted` – Triggered when the query is autocompleted. Autocompleted means the query was changed to the hint. The event handler will be invoked with 3 arguments: the jQuery event object, the suggestion object, and the name of the dataset the suggestion belongs to.

- `autocomplete:redrawn` – Triggered when `appendTo` is used and the wrapper is resized/repositionned.

All custom events are triggered on the element initialized as the autocomplete.

## API

### Standalone

The standalone version API is similiar to jQuery's:

```js
var search = autocomplete(containerSelector, globalOptions, datasets);
```

Example:

```js
var search = autocomplete('#search', { hint: false }, [
  {
    source: autocomplete.sources.hits(index, { hitsPerPage: 5 }),
  },
]);

search.autocomplete.open();
search.autocomplete.close();
search.autocomplete.getVal();
search.autocomplete.setVal('Hey Jude');
search.autocomplete.destroy();
search.autocomplete.getWrapper(); // since autocomplete.js wraps your input into another div, you can access that div
```

You can also pass a custom Typeahead instance in Autocomplete.js constructor:

```js
var search = autocomplete('#search', { hint: false }, [{ ... }], new Typeahead({ ... }));
``` -->
