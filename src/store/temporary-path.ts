import { randomBytes } from 'node:crypto';
import { basename, dirname, join } from 'node:path';

/** Matches the file names produced by `temporaryPath`. */
export const TEMPORARY_NAME_PATTERN = /^\..+\.\d+\.[0-9a-f]{8}\.tmp$/;

/** Unique sibling path for an in-flight atomic write: `.<name>.<pid>.<8 hex digits>.tmp`. */
export const temporaryPath = (path: string): string =>
  join(dirname(path), `.${basename(path)}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`);
