import { utimesSync } from 'node:fs';
import { join } from 'node:path';

import { MARKER } from './store-constants';

/** Records the last use of a scratchpad (basis for the TTL). */
export const touchMarker = (dir: string): void => {
  const now = new Date();

  utimesSync(join(dir, MARKER), now, now);
};
