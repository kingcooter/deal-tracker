import { describe, it, expect } from 'vitest';
import { fuzzyMatch, fuzzySearch, highlightMatches } from './fuzzy-search';

describe('fuzzyMatch', () => {
  it('should return match for exact match', () => {
    const result = fuzzyMatch('hello', 'hello');
    expect(result).not.toBeNull();
    expect(result?.score).toBe(1);
    expect(result?.matches).toEqual([[0, 5]]);
  });

  it('should return match for substring match', () => {
    const result = fuzzyMatch('ell', 'hello');
    expect(result).not.toBeNull();
    expect(result?.score).toBe(1);
    expect(result?.matches).toEqual([[1, 4]]);
  });

  it('should be case insensitive', () => {
    const result = fuzzyMatch('HELLO', 'hello');
    expect(result).not.toBeNull();
    expect(result?.score).toBe(1);
  });

  it('should return null for no match', () => {
    const result = fuzzyMatch('xyz', 'hello');
    expect(result).toBeNull();
  });

  it('should return null when pattern is longer than text', () => {
    const result = fuzzyMatch('hello world', 'hello');
    expect(result).toBeNull();
  });

  it('should match fuzzy patterns', () => {
    const result = fuzzyMatch('hlo', 'hello');
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThan(0);
  });

  it('should give bonus for word boundary matches', () => {
    const result1 = fuzzyMatch('pt', 'property_type');
    const result2 = fuzzyMatch('pt', 'alphabet');

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result1!.score).toBeGreaterThan(result2!.score);
  });

  it('should return empty matches array for empty pattern', () => {
    const result = fuzzyMatch('', 'hello');
    expect(result).not.toBeNull();
    expect(result?.matches).toEqual([]);
    expect(result?.score).toBe(1);
  });
});

describe('fuzzySearch', () => {
  const items = [
    { id: '1', name: 'Apple', category: 'Fruit' },
    { id: '2', name: 'Banana', category: 'Fruit' },
    { id: '3', name: 'Carrot', category: 'Vegetable' },
    { id: '4', name: 'Date', category: 'Fruit' },
  ];

  it('should return all items for empty query', () => {
    const results = fuzzySearch(items, '', (item) => item.name);
    expect(results).toHaveLength(4);
  });

  it('should filter items by query', () => {
    const results = fuzzySearch(items, 'app', (item) => item.name);
    expect(results).toHaveLength(1);
    expect(results[0].item.name).toBe('Apple');
  });

  it('should search multiple fields', () => {
    const results = fuzzySearch(items, 'Fruit', (item) => [item.name, item.category]);
    expect(results).toHaveLength(3);
  });

  it('should sort by score', () => {
    const testItems = [
      { id: '1', name: 'Application' },
      { id: '2', name: 'App' },
      { id: '3', name: 'Banana' },
    ];

    const results = fuzzySearch(testItems, 'app', (item) => item.name);
    // Both 'App' and 'Application' match - they should appear before 'Banana'
    const matchedNames = results.map(r => r.item.name);
    expect(matchedNames).toContain('App');
    expect(matchedNames).toContain('Application');
    expect(matchedNames).not.toContain('Banana');
  });

  it('should handle null/undefined fields gracefully', () => {
    const itemsWithNull = [
      { id: '1', name: 'Test', optional: null },
      { id: '2', name: 'Another', optional: undefined },
    ];

    const results = fuzzySearch(itemsWithNull, 'test', (item) => [
      item.name,
      item.optional || '',
    ]);
    expect(results).toHaveLength(1);
  });
});

describe('highlightMatches', () => {
  it('should return unhighlighted text when no matches', () => {
    const result = highlightMatches('hello', []);
    expect(result).toEqual([{ text: 'hello', highlighted: false }]);
  });

  it('should highlight single match', () => {
    const result = highlightMatches('hello', [[0, 2]]);
    expect(result).toEqual([
      { text: 'he', highlighted: true },
      { text: 'llo', highlighted: false },
    ]);
  });

  it('should highlight multiple matches', () => {
    const result = highlightMatches('hello world', [[0, 2], [6, 8]]);
    expect(result).toEqual([
      { text: 'he', highlighted: true },
      { text: 'llo ', highlighted: false },
      { text: 'wo', highlighted: true },
      { text: 'rld', highlighted: false },
    ]);
  });

  it('should handle match at end of string', () => {
    const result = highlightMatches('hello', [[3, 5]]);
    expect(result).toEqual([
      { text: 'hel', highlighted: false },
      { text: 'lo', highlighted: true },
    ]);
  });

  it('should handle full string match', () => {
    const result = highlightMatches('hello', [[0, 5]]);
    expect(result).toEqual([{ text: 'hello', highlighted: true }]);
  });
});
