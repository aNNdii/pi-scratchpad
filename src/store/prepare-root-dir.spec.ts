import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  statSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { prepareRootDir, type PrepareOptions } from './prepare-root-dir';
import { readMarker } from './read-marker';
import { MARKER } from './store-constants';

let root: string;

const createOptions = (dir: string, overrides: Partial<PrepareOptions> = {}): PrepareOptions => ({
  dir,
  sessionId: 's1',
  cwd: '/w',
  hadScratchpad: false,
  ...overrides,
});

const modeOf = (path: string) => statSync(path).mode & 0o777;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sp-prepare-'));
});

describe('prepareRootDir', () => {
  it('should create dir and marker with restrictive modes', () => {
    const dir = join(root, 'slug', 's1');

    expect(prepareRootDir(createOptions(dir))).toBe('created');
    expect(modeOf(dir)).toBe(0o700);
    expect(modeOf(join(dir, MARKER))).toBe(0o600);
    expect(readMarker(dir)).toMatchObject({ version: 1, sessionId: 's1', cwd: '/w' });
  });

  it('should touch the marker of an existing dir', () => {
    const dir = join(root, 's1');
    prepareRootDir(createOptions(dir));
    utimesSync(join(dir, MARKER), new Date(0), new Date(0));

    expect(prepareRootDir(createOptions(dir))).toBe('existing');
    expect(statSync(join(dir, MARKER)).mtimeMs).toBeGreaterThan(Date.now() - 60_000);
  });

  it('should report recreated when the session had a scratchpad before', () =>
    expect(prepareRootDir(createOptions(join(root, 's1'), { hadScratchpad: true }))).toBe('recreated'));

  it('should not copy in-flight atomic writes of a fork source', () => {
    const source = join(root, 'source');
    prepareRootDir({ dir: source, sessionId: 'p1', cwd: '/w', hadScratchpad: false });
    writeFileSync(join(source, '.a.md.1.abcdef01.tmp'), 'partial');
    writeFileSync(join(source, 'draft.tmp'), 'draft');

    const dir = join(root, 'fork');
    prepareRootDir(createOptions(dir, { forkSource: { dir: source, sessionId: 'p1' } }));

    expect(existsSync(join(dir, '.a.md.1.abcdef01.tmp'))).toBe(false);
    expect(readFileSync(join(dir, 'draft.tmp'), 'utf8')).toBe('draft');
  });

  it('should copy a fork source without symlinks and record forkedFrom', () => {
    const source = join(root, 'source');
    prepareRootDir({ dir: source, sessionId: 'p1', cwd: '/w', hadScratchpad: false });
    mkdirSync(join(source, 'agents'));
    writeFileSync(join(source, 'agents', 'a.md'), '# A');
    writeFileSync(join(root, 'outside.txt'), 'x');
    symlinkSync(join(root, 'outside.txt'), join(source, 'link.txt'));

    const dir = join(root, 'fork');

    expect(prepareRootDir(createOptions(dir, { forkSource: { dir: source, sessionId: 'p1' } }))).toBe('forked');
    expect(readFileSync(join(dir, 'agents', 'a.md'), 'utf8')).toBe('# A');
    expect(existsSync(join(dir, 'link.txt'))).toBe(false);
    expect(readMarker(dir)).toMatchObject({ sessionId: 's1', forkedFrom: 'p1' });
  });

  it('should report fork-failed when the fork source is missing', () => {
    const dir = join(root, 'fork');

    expect(prepareRootDir(createOptions(dir, { forkSource: { dir: join(root, 'nope'), sessionId: 'p1' } }))).toBe(
      'fork-failed'
    );

    expect(readMarker(dir)?.sessionId).toBe('s1');
  });
});
