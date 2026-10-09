import { lstatSync } from 'node:fs';
import { join } from 'node:path';

import { readMarker } from './read-marker';
import { MARKER } from './store-constants';

/**
 * Time of the last use of the scratchpad `dir` in epoch milliseconds (see `touchMarker`). Returns
 * `undefined` when `dir` is not a scratchpad: no regular, valid marker file, also when it vanishes
 * while being read.
 */
export const readLastUse = (dir: string): number | undefined => {
  try {
    const { mtimeMs } = lstatSync(join(dir, MARKER));

    return readMarker(dir) == null ? undefined : mtimeMs;
  } catch {
    return undefined;
  }
};
