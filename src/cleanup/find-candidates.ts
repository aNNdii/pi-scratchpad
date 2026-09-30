import { lstatSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { MARKER, readMarker } from '../store';

export type Candidate = {
  dir: string;
  /** Marker mtime: last use of the scratchpad. */
  mtimeMs: number;
};

const isRealDirectory = (path: string): boolean => {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
};

const readDirectory = (path: string): string[] => {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
};

/**
 * Scratchpads that may be deleted: real directories exactly at `<base>/<slug>/<session>` with a
 * valid marker file, not listed in `protectedDirs` (spec §11).
 */
export const findCandidates = (baseDir: string, protectedDirs: Set<string>): Candidate[] => {
  if (!isRealDirectory(baseDir)) return [];

  const protectedResolved = new Set([...protectedDirs].map(dir => resolve(dir)));
  const candidates: Candidate[] = [];

  for (const slug of readDirectory(baseDir)) {
    const slugDir = join(baseDir, slug);
    if (!isRealDirectory(slugDir)) continue;

    for (const session of readDirectory(slugDir)) {
      const dir = join(slugDir, session);
      if (!isRealDirectory(dir) || protectedResolved.has(resolve(dir)) || readMarker(dir) == null) continue;

      candidates.push({ dir, mtimeMs: lstatSync(join(dir, MARKER)).mtimeMs });
    }
  }

  return candidates;
};
