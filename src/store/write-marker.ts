import { join } from 'node:path';

import type { Marker } from './marker';
import { MARKER } from './store-constants';
import { writeFileAtomic } from './write-file-atomic';

export const writeMarker = (dir: string, marker: Marker): void =>
  writeFileAtomic(join(dir, MARKER), `${JSON.stringify(marker, null, 2)}\n`);
