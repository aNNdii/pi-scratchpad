import { describe, expect, it } from 'vitest';

import { renderIndex } from './render-index';

const createEntries = (count: number, title = 't') =>
  Array.from({ length: count }, (_, index) => ({
    path: `f${index}.md`,
    size: 2048,
    mtimeMs: count - index,
    author: 'main',
    title,
  }));

describe('renderIndex', () => {
  it('should cap the number of entries', () => {
    const lines = renderIndex('/d', createEntries(60)).split('\n');

    expect(lines.filter(line => line.startsWith('- '))).toHaveLength(50);
    expect(lines.at(-1)).toBe('… and 10 more files — run `ls -R /d`.');
  });

  it('should format sizes', () => expect(renderIndex('/d', createEntries(1))).toContain('2.0 KB'));

  it('should cap the byte size', () => {
    const text = renderIndex('/d', createEntries(60, 'y'.repeat(100)), { maxEntries: 50, maxBytes: 1024 });

    expect(Buffer.byteLength(text)).toBeLessThanOrEqual(1024);
    expect(text).toMatch(/… and \d+ more files/);
  });
});
