import { describe, expect, it } from 'vitest';

import { titleFor } from './title-for';

describe('titleFor', () => {
  it('should prefer the first heading', () => expect(titleFor(Buffer.from('intro\n# Heading\nx'))).toBe('Heading'));

  it('should fall back to the first non-empty line', () =>
    expect(titleFor(Buffer.from('\n\n  plain first line  \n'))).toBe('plain first line'));

  it('should trim to 100 characters', () => expect(titleFor(Buffer.from(`# ${'x'.repeat(150)}`))).toHaveLength(100));
  it('should mark binary content', () => expect(titleFor(Buffer.from([0x41, 0x00, 0x42]))).toBe('(binary)'));
  it('should return an empty title for empty files', () => expect(titleFor(Buffer.from(''))).toBe(''));
});
