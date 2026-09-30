import { closeSync, lstatSync, openSync, readdirSync, readSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { MARKER } from '../store';

import { authorFor } from './author-for';
import type { IndexEntry } from './index-entry';
import { titleFor } from './title-for';

const HEAD_BYTES = 4096;

const readHead = (path: string): Buffer => {
  const descriptor = openSync(path, 'r');

  try {
    const buffer = Buffer.alloc(HEAD_BYTES);

    return buffer.subarray(0, readSync(descriptor, buffer, 0, HEAD_BYTES, 0));
  } finally {
    closeSync(descriptor);
  }
};

const readTitle = (path: string): string => {
  try {
    return titleFor(readHead(path));
  } catch {
    return '';
  }
};

/** All regular files below `dir` (no symlinks, no marker, no temp files), newest first. */
export const listEntries = (dir: string): IndexEntry[] => {
  const entries: IndexEntry[] = [];

  const walk = (current: string): void => {
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      const stat = lstatSync(path);

      if (stat.isDirectory()) {
        walk(path);
        continue;
      }

      if (!stat.isFile() || name === MARKER || name.endsWith('.tmp')) continue;

      const relativePath = relative(dir, path).split(sep).join('/');

      entries.push({
        path: relativePath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        author: authorFor(relativePath),
        title: readTitle(path),
      });
    }
  };

  walk(dir);

  return entries.toSorted((a, b) => b.mtimeMs - a.mtimeMs || a.path.localeCompare(b.path));
};
