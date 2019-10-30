import { flatten } from '../flatten';

describe('flatten', () => {
  test('flatten arrays', () => {
    expect(flatten([[1, 2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });
});
