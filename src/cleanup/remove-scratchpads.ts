import { rmdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** Deletes the given scratchpads and then every emptied slug directory; never `baseDir` itself. */
export const removeScratchpads = (baseDir: string, dirs: string[]): string[] => {
  const deleted: string[] = [];

  for (const dir of dirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
      deleted.push(dir);
    } catch {
      // Keep going; a later run retries.
    }
  }

  for (const slugDir of new Set(deleted.map(dir => dirname(dir)))) {
    if (resolve(slugDir) === resolve(baseDir)) continue;

    try {
      rmdirSync(slugDir);
    } catch {
      // Not empty or already gone.
    }
  }

  return deleted;
};
