import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { prepareRootDir } from '../store';

import { cleanupAll } from './cleanup-all';

describe('cleanupAll', () => {
  it('should delete all unprotected scratchpads', () => {
    const base = mkdtempSync(join(tmpdir(), 'sp-all-'));
    const first = join(base, 'a', 'x');
    const second = join(base, 'a', 'y');

    prepareRootDir({ dir: first, sessionId: 'x', cwd: '/w', hadScratchpad: false });
    prepareRootDir({ dir: second, sessionId: 'y', cwd: '/w', hadScratchpad: false });

    expect(cleanupAll(base, new Set([second]))).toEqual([first]);
    expect(existsSync(second)).toBe(true);
  });
});
