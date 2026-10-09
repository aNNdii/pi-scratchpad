import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { DIRECTORY_MODE, FILE_MODE } from './store-constants';
import { temporaryPath } from './temporary-path';

/** Writes via temp file + rename so concurrent readers never see partial content. */
export const writeFileAtomic = (path: string, content: string): void => {
  const temporary = temporaryPath(path);

  mkdirSync(dirname(path), { recursive: true, mode: DIRECTORY_MODE });
  writeFileSync(temporary, content, { mode: FILE_MODE });
  renameSync(temporary, path);
};
