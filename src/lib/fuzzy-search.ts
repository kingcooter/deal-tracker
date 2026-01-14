/**
 * Simple fuzzy search implementation
 * Returns a score (higher = better match) and matched ranges for highlighting
 */

export interface FuzzyMatch {
  score: number;
  matches: Array<[number, number]>; // [start, end] indices
}

/**
 * Performs fuzzy matching on a string
 * Returns score (0-1) and match indices for highlighting
 */
export function fuzzyMatch(pattern: string, text: string): FuzzyMatch | null {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();

  if (patternLower.length === 0) {
    return { score: 1, matches: [] };
  }

  if (patternLower.length > textLower.length) {
    return null;
  }

  // Try exact match first
  const exactIndex = textLower.indexOf(patternLower);
  if (exactIndex !== -1) {
    return {
      score: 1,
      matches: [[exactIndex, exactIndex + pattern.length]],
    };
  }

  // Fuzzy match - all pattern characters must be found in order
  const matches: Array<[number, number]> = [];
  let patternIdx = 0;
  let lastMatchEnd = -1;
  let score = 0;
  let consecutiveBonus = 0;

  for (let i = 0; i < textLower.length && patternIdx < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIdx]) {
      // Check if continuing a previous match
      if (lastMatchEnd === i) {
        // Extend the last match
        matches[matches.length - 1][1] = i + 1;
        consecutiveBonus += 0.1;
      } else {
        // Start a new match
        matches.push([i, i + 1]);
        consecutiveBonus = 0;
      }

      // Bonus for matching at word boundaries
      const isWordStart = i === 0 || /[\s_\-/.]/.test(text[i - 1]);
      if (isWordStart) {
        score += 0.2;
      }

      // Bonus for matching at start
      if (i === 0) {
        score += 0.1;
      }

      lastMatchEnd = i + 1;
      patternIdx++;
    }
  }

  // Did we match all pattern characters?
  if (patternIdx !== patternLower.length) {
    return null;
  }

  // Calculate final score
  const matchRatio = patternLower.length / textLower.length;
  score += matchRatio * 0.5 + consecutiveBonus;

  // Normalize score to 0-1
  score = Math.min(1, score);

  return { score, matches };
}

/**
 * Search and sort items by fuzzy match score
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string | string[]
): Array<{ item: T; match: FuzzyMatch }> {
  if (!query.trim()) {
    return items.map((item) => ({ item, match: { score: 1, matches: [] } }));
  }

  const results: Array<{ item: T; match: FuzzyMatch }> = [];

  for (const item of items) {
    const searchTexts = getSearchText(item);
    const texts = Array.isArray(searchTexts) ? searchTexts : [searchTexts];

    let bestMatch: FuzzyMatch | null = null;

    for (const text of texts) {
      if (!text) continue;
      const match = fuzzyMatch(query, text);
      if (match && (!bestMatch || match.score > bestMatch.score)) {
        bestMatch = match;
      }
    }

    if (bestMatch) {
      results.push({ item, match: bestMatch });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.match.score - a.match.score);
}

/**
 * Highlight matched portions of text
 */
export function highlightMatches(
  text: string,
  matches: Array<[number, number]>
): Array<{ text: string; highlighted: boolean }> {
  if (matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  const result: Array<{ text: string; highlighted: boolean }> = [];
  let lastIndex = 0;

  for (const [start, end] of matches) {
    // Add non-highlighted text before match
    if (start > lastIndex) {
      result.push({ text: text.slice(lastIndex, start), highlighted: false });
    }
    // Add highlighted match
    result.push({ text: text.slice(start, end), highlighted: true });
    lastIndex = end;
  }

  // Add remaining non-highlighted text
  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), highlighted: false });
  }

  return result;
}
