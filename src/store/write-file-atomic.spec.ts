import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { writeFileAtomic } from './write-file-atomic';

describe('writeFileAtomic', () => {
  it('should write 0600 files and leave no temp files', () => {
    const root = mkdtempSync(join(tmpdir(), 'sp-atomic-'));
    const file = join(root, 'a', 'b.md');
    writeFileAtomic(file, 'hello');

    expect(readFileSync(file, 'utf8')).toBe('hello');
    expect(statSync(file).mode & 0o777).toBe(0o600);
    expect(readdirSync(join(root, 'a'))).toEqual(['b.md']);
  });
});
