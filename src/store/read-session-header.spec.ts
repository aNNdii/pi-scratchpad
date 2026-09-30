import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readSessionHeader } from './read-session-header';

describe('readSessionHeader', () => {
  it('should parse the first JSONL line', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'sp-header-')), 's.jsonl');
    writeFileSync(file, `${JSON.stringify({ type: 'session', id: 'p1', cwd: '/w', timestamp: 't' })}\n{}\n`);

    expect(readSessionHeader(file)).toEqual({ id: 'p1', cwd: '/w' });
  });

  it('should return undefined for a missing file', () =>
    expect(readSessionHeader(join(tmpdir(), 'sp-missing-header.jsonl'))).toBeUndefined());
});
