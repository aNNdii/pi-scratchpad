import { describe, expect, it } from 'vitest';

import { formatSize } from './format-size';

describe('formatSize', () => {
  it('should format bytes', () => expect(formatSize(840)).toBe('840 B'));
  it('should format kilobytes', () => expect(formatSize(2048)).toBe('2.0 KB'));
  it('should format megabytes', () => expect(formatSize(3 * 1024 * 1024)).toBe('3.0 MB'));
});
