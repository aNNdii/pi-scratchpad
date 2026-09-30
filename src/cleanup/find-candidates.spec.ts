import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { MARKER, prepareRootDir } from '../store';

import { findCandidates } from './find-candidates';

let base: string;

const createScratchpad = (slug: string, id: string): string => {
  const dir = join(base, slug, id);
  prepareRootDir({ dir, sessionId: id, cwd: '/w', hadScratchpad: false });

  return dir;
};

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'sp-candidates-'));
});

describe('findCandidates', () => {
  it('should ignore unmarked dirs', () => {
    mkdirSync(join(base, 'slug', 'foreign'), { recursive: true });
    writeFileSync(join(base, 'slug', 'foreign', 'data.txt'), 'keep');

    expect(findCandidates(base, new Set())).toEqual([]);
  });

  it('should ignore invalid markers', () => {
    mkdirSync(join(base, 'slug', 'bad'), { recursive: true });
    writeFileSync(join(base, 'slug', 'bad', MARKER), '{ nope');

    expect(findCandidates(base, new Set())).toEqual([]);
  });

  it('should ignore symlinked session and slug dirs', () => {
    const real = createScratchpad('real', 's1');
    mkdirSync(join(base, 'slug'));
    symlinkSync(real, join(base, 'slug', 'linked'));
    symlinkSync(join(base, 'real'), join(base, 'linkslug'));

    expect(findCandidates(base, new Set()).map(candidate => candidate.dir)).toEqual([real]);
  });

  it('should skip protected dirs', () => {
    const active = createScratchpad('a', 'active');

    expect(findCandidates(base, new Set([active]))).toEqual([]);
  });

  it('should handle a missing base dir', () => expect(findCandidates(join(base, 'missing'), new Set())).toEqual([]));
});
