import { existsSync, mkdtempSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { MARKER, prepareRootDir } from '../store';

import { cleanupExpired } from './cleanup-expired';

const DAY_MS = 86_400_000;

let base: string;

const createScratchpad = (slug: string, id: string, ageDays: number): string => {
  const dir = join(base, slug, id);
  const lastUse = new Date(Date.now() - ageDays * DAY_MS);

  prepareRootDir({ dir, sessionId: id, cwd: '/w', hadScratchpad: false });
  utimesSync(join(dir, MARKER), lastUse, lastUse);

  return dir;
};

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'sp-expired-'));
});

describe('cleanupExpired', () => {
  it('should delete expired and keep fresh and protected scratchpads', () => {
    const old = createScratchpad('a', 'old', 20);
    const fresh = createScratchpad('a', 'fresh', 1);
    const active = createScratchpad('b', 'active', 30);
    const lonely = createScratchpad('c', 'lonely', 30);

    expect(cleanupExpired(base, 14, new Set([active])).toSorted()).toEqual([lonely, old].toSorted());
    expect(existsSync(fresh)).toBe(true);
    expect(existsSync(active)).toBe(true);
  });

  it('should remove emptied slug dirs but never the base', () => {
    createScratchpad('c', 'lonely', 30);
    cleanupExpired(base, 14, new Set());

    expect(existsSync(join(base, 'c'))).toBe(false);
    expect(existsSync(base)).toBe(true);
  });

  it('should do nothing when ttlDays is 0', () => {
    const old = createScratchpad('a', 'old', 400);

    expect(cleanupExpired(base, 0, new Set())).toEqual([]);
    expect(existsSync(old)).toBe(true);
  });
});
