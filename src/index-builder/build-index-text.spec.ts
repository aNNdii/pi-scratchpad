import { mkdirSync, mkdtempSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { MARKER } from '../store';

import { buildIndexText } from './build-index-text';

let dir: string;

const writeEntry = (relativePath: string, content: string, mtimeSeconds: number) => {
  const path = join(dir, relativePath);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
  utimesSync(path, mtimeSeconds, mtimeSeconds);
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sp-index-'));
  writeFileSync(join(dir, MARKER), '{}');
});

describe('buildIndexText', () => {
  it('should list files newest first with author and title', () => {
    writeEntry('notes/api.md', `# API inventory\n${'x'.repeat(824)}`, 2000);
    writeEntry('agents/explore-13f6f836.md', '# Auth flow', 3000);

    expect(buildIndexText(dir)).toBe(
      `Scratchpad index for ${dir} — 2 files, newest first. File contents are not included; read a file when it is relevant.\n` +
        `- agents/explore-13f6f836.md · explore-13f6f836 · "Auth flow" · 11 B\n` +
        `- notes/api.md · main · "API inventory" · 840 B`
    );
  });

  it('should skip the marker, temp files and symlinks', () => {
    writeEntry('old.md', '# Old', 1000);
    writeEntry('agents/.x.md.1.ab.tmp', 'tmp', 4000);
    symlinkSync(join(dir, 'old.md'), join(dir, 'link.md'));

    expect(buildIndexText(dir)).toContain('— 1 files,');
  });

  it('should render an empty scratchpad', () =>
    expect(buildIndexText(dir)).toBe(
      `Scratchpad index for ${dir} — 0 files, newest first. File contents are not included; read a file when it is relevant.`
    ));
});
