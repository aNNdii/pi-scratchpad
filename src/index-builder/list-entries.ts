import { closeSync, lstatSync, openSync, readdirSync, readSync, type Stats } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { agentLabelOfPath } from '../paths';
import { isBookkeepingFile } from '../store';

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

// Agents write into the scratchpad while it is listed: entries can vanish between listing a folder
// and reading them. Such entries are simply not part of the index.
const statIfPresent = (path: string): Stats | undefined => {
  try {
    return lstatSync(path);
  } catch {
    return undefined;
  }
};

const namesIfPresent = (path: string): string[] => {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
};

/**
 * All regular content files below the scratchpad `dir` (no symlinks, no bookkeeping files), newest
 * first. Files that disappear during the walk are left out; a missing `dir` throws.
 */
export const listEntries = (dir: string): IndexEntry[] => {
  const entries: IndexEntry[] = [];

  const walk = (current: string, names: string[]): void => {
    for (const name of names) {
      const path = join(current, name);
      const stat = statIfPresent(path);

      if (stat?.isDirectory() === true) {
        walk(path, namesIfPresent(path));
        continue;
      }

      if (stat?.isFile() !== true || isBookkeepingFile(name)) continue;

      const relativePath = relative(dir, path).split(sep).join('/');

      entries.push({
        path: relativePath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        author: agentLabelOfPath(relativePath) ?? 'main',
        title: readTitle(path),
      });
    }
  };

  walk(dir, readdirSync(dir));

  return entries.toSorted((a, b) => b.mtimeMs - a.mtimeMs || a.path.localeCompare(b.path));
};
