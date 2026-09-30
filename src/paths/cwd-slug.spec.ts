import { describe, expect, it } from 'vitest';

import { cwdSlug } from './cwd-slug';

describe('cwdSlug', () => {
  it('should replace slashes and dots', () => expect(cwdSlug('/Users/a.b/x')).toBe('-Users-a-b-x'));
  it('should replace backslashes and colons', () => expect(cwdSlug(String.raw`C:\work\repo`)).toBe('C--work-repo'));
});
