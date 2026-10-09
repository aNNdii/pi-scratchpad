import { lstatSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { listEntries } from './list-entries';

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>();

  return { ...actual, lstatSync: vi.fn(actual.lstatSync) };
});

const actualFs = await vi.importActual<typeof import('node:fs')>('node:fs');

const enoent = (path: string): Error => Object.assign(new Error(`ENOENT: ${path}`), { code: 'ENOENT' });

// Simulates files that another agent renames or deletes after `readdirSync` listed them.
const vanishOnStat = (...names: string[]): void => {
  vi.mocked(lstatSync).mockImplementation(((path: string) => {
    if (names.some(name => path.endsWith(name))) throw enoent(path);

    return actualFs.lstatSync(path);
  }) as typeof lstatSync);
};

afterEach(() => {
  vi.mocked(lstatSync).mockReset();
});

describe('listEntries', () => {
  it('should leave out files that vanish while the scratchpad is listed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-entries-'));
    writeFileSync(join(dir, 'kept.md'), '# Kept');
    writeFileSync(join(dir, 'gone.md'), '# Gone');
    vanishOnStat('gone.md');

    expect(listEntries(dir).map(entry => entry.path)).toEqual(['kept.md']);
  });

  it('should leave out folders that vanish while the scratchpad is listed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-entries-'));
    mkdirSync(join(dir, 'agents', 'explore-1'), { recursive: true });
    writeFileSync(join(dir, 'agents', 'explore-1', 'notes.md'), '# Notes');
    vanishOnStat('explore-1');

    expect(listEntries(dir)).toEqual([]);
  });

  it('should throw when the scratchpad itself is missing', () =>
    expect(() => listEntries(join(tmpdir(), 'sp-entries-missing', 'nope'))).toThrow());
});
