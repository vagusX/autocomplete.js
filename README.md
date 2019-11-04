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
autocomplete({
  container: '#autocomplete',
  getSources() {
    return [];
  },
});
```

## Installation

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

#### `getSources`

> `(options: { query: string }) => Source[]` | **required**

#### `dropdownContainer`

> `string | HTMLElement` | defaults to `document.body`

#### `dropdownPosition`

> `'left' | 'right'` | defaults to `'left'`

#### `placeholder`

> `string` | defaults to `""`

#### `showCompletion`

> `boolean` | defaults to `false`

#### `minLength`

> `number` | defaults to `1`

#### `autofocus`

> `boolean` | defaults to `false`

#### `keyboardShortcuts`

> `string[]`

#### `defaultHighlightedIndex`

> `number` | defaults to `0` (the first item)

#### `stalledDelay`

> `number` | defaults to `300`

#### `initialState`

> `State`

#### `templates`

> `GlobalTemplates`

#### `environment`

> `typeof window` | defaults to `window`

#### `onFocus`

> `(options) => void`

#### `onError`

> `(options) => void`

#### `onClick`

> `(event: MouseEvent, options) => void`

#### `onKeyDown`

> `(event: KeyboardEvent, options) => void`

### Sources

An Autocomplete source refers to an object with the following properties:

#### `getSuggestionValue`

> `(options: { suggestion: Suggestion, state: State }) => string`

Function called to get the value of the suggestion. The value is used to fill the search box.

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

Function called when the input changes. You can use this function to filter/search the items based on the query.

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

> (options: { state: State }) => string | JSX.Element

The template to display before the suggestions.

##### `suggestion`

> (options: { suggestion: Suggestion, state: State }) => string | JSX.Element

The template for each suggestion.

##### `footer`

> (options: { state: State }) => string | JSX.Element

The template to display after the suggestions.

##### `empty`

> (options: { state: State }) => string | JSX.Element

The template to display when there are no suggestions.

<details>
  <summary>Example</summary>

**Using strings**

```js
const items = [{ value: 'Apple' }, { value: 'Banana' }];

const source = {
  templates: {
    header() {
      return '<h2>Fruits</h2>'
    },
    suggestion({ suggestion }) (
      return suggestion.value
    ),
    footer() {
      return '<a href="/fruits">See more</a>'
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
      return <h2>Fruits</h2>
    },
    suggestion({ suggestion }) (
      return suggestion.value
    ),
    footer() {
      return <a href="/fruits">See more</a>
    },
  },
  // ...
};
```

</details>

#### `onSelect`

> `(options) => void`

Function called when an item is selected.

#### `onInput`

> `(options) => void`

Function called when the input changes.

#### `onEmpty`

> `(options) => void`

Function called when there are not results.

### State

<!-- TODO -->

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
