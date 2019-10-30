import {
  parseHighlightedAttribute,
  highlightAlgoliaHit,
  reverseHighlightAlgoliaHit,
} from '../highlight';

describe('highlight', () => {
  describe('parseHighlightedAttribute', () => {
    test('returns highlighting parts', () => {
      expect(
        parseHighlightedAttribute({
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          highlightedValue: '<mark>He</mark>llo t<mark>he</mark>re',
        })
      ).toEqual([
        { isHighlighted: true, value: 'He' },
        { isHighlighted: false, value: 'llo t' },
        { isHighlighted: true, value: 'he' },
        { isHighlighted: false, value: 're' },
      ]);
    });
  });

  describe('highlightAlgoliaHit', () => {
    test('returns the highlighted value of the hit', () => {
      expect(
        highlightAlgoliaHit({
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          attribute: 'title',
          hit: {
            _highlightResult: {
              title: {
                value: '<mark>He</mark>llo t<mark>he</mark>re',
              },
            },
          },
        })
      ).toEqual('<mark>He</mark>llo t<mark>he</mark>re');
    });
  });

  describe('reverseHighlightAlgoliaHit', () => {
    test('returns the reverse-highlighted value of the hit', () => {
      expect(
        reverseHighlightAlgoliaHit({
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          attribute: 'title',
          hit: {
            _highlightResult: {
              title: {
                value: '<mark>He</mark>llo t<mark>he</mark>re',
              },
            },
          },
        })
      ).toEqual('He<mark>llo t</mark>he<mark>re</mark>');
    });

    test('returns the non-highlighted value when every part matches', () => {
      expect(
        reverseHighlightAlgoliaHit({
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          attribute: 'title',
          hit: { _highlightResult: { title: { value: 'Hello' } } },
        })
      ).toEqual('Hello');
    });
  });
});
