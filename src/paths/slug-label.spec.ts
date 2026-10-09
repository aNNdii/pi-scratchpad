import { describe, expect, it } from 'vitest';

import { slugLabel } from './slug-label';

describe('slugLabel', () => {
  it('should slugify names', () => expect(slugLabel(' General Purpose! ')).toBe('general-purpose'));
});
