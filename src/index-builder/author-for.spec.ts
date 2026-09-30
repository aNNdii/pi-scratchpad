import { describe, expect, it } from 'vitest';

import { authorFor } from './author-for';

describe('authorFor', () => {
  it('should attribute a result file to its agent', () =>
    expect(authorFor('agents/explore-13f6f836.md')).toBe('explore-13f6f836'));

  it('should attribute files in an agent folder to that agent', () =>
    expect(authorFor('agents/explore-13f6f836/notes.md')).toBe('explore-13f6f836'));

  it('should attribute other files to main', () => expect(authorFor('notes/api.md')).toBe('main'));
  it('should attribute a bare agents file to main', () => expect(authorFor('agents')).toBe('main'));
});
