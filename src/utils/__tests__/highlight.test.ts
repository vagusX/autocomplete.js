import {
  parseHighlightedAttribute,
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from '../highlight';

describe('highlight', () => {
  test('parseHighlightedAttribute', () => {
    expect(
      parseHighlightedAttribute({
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        highlightedValue: '<mark>Hell</mark>o',
      })
    ).toEqual([
      { isHighlighted: true, value: 'Hell' },
      { isHighlighted: false, value: 'o' },
    ]);
  });

  test('highlightAlgoliaHit', () => {
    expect(
      highlightAlgoliaHit({
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        attribute: 'title',
        hit: { _highlightResult: { title: { value: '<mark>Hell</mark>o' } } },
      })
    ).toEqual('<mark>Hell</mark>o');
  });

  test('reverseHighlightAlgoliaHit', () => {
    expect(
      reverseHighlightAlgoliaHit({
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        attribute: 'title',
        hit: { _highlightResult: { title: { value: '<mark>Hell</mark>o' } } },
      })
    ).toEqual('Hell<mark>o</mark>');
  });
});
