import { lstatSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { readLastUse } from '../store';

export type Candidate = {
  dir: string;
  /** Last use of the scratchpad in epoch milliseconds. */
  lastUseMs: number;
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
 * Scratchpads that may be deleted: real directories (not symlinks) exactly at
 * `<baseDir>/<cwd-slug>/<session-id>` that carry a valid marker and are not listed in
 * `protectedDirs`. Anything else below `baseDir`, including directories that vanish meanwhile, is
 * never a candidate.
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
      if (!isRealDirectory(dir) || protectedResolved.has(resolve(dir))) continue;

      const lastUseMs = readLastUse(dir);
      if (lastUseMs != null) candidates.push({ dir, lastUseMs });
    }
  }

  return candidates;
};
