import { randomBytes } from 'node:crypto';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { DIRECTORY_MODE, FILE_MODE } from './store-constants';

/** Writes via temp file + rename so concurrent readers never see partial content. */
export const writeFileAtomic = (path: string, content: string): void => {
  const directory = dirname(path);
  const temporaryPath = join(directory, `.${basename(path)}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`);

  mkdirSync(directory, { recursive: true, mode: DIRECTORY_MODE });
  writeFileSync(temporaryPath, content, { mode: FILE_MODE });
  renameSync(temporaryPath, path);
};
