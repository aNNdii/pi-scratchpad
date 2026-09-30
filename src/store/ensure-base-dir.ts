import { existsSync, lstatSync, mkdirSync } from 'node:fs';

import { isSymlink } from './is-symlink';
import { DIRECTORY_MODE } from './store-constants';

/** Creates the base directory (0700) or verifies that an existing one is safe to use. Throws when unsafe. */
export const ensureBaseDir = (baseDir: string): void => {
  if (!existsSync(baseDir) && !isSymlink(baseDir)) {
    mkdirSync(baseDir, { recursive: true, mode: DIRECTORY_MODE });

    return;
  }

  const stat = lstatSync(baseDir);
  if (stat.isSymbolicLink()) throw new Error(`Scratchpad base ${baseDir} is a symlink`);

  if (!stat.isDirectory()) throw new Error(`Scratchpad base ${baseDir} is not a directory`);

  const uid = process.getuid?.();
  if (uid != null && stat.uid !== uid) throw new Error(`Scratchpad base ${baseDir} is owned by another user`);
};
