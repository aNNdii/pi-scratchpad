import { join } from 'node:path';

import type { Marker } from './marker';
import { MARKER } from './store-constants';
import { writeFileAtomic } from './write-file-atomic';

/** Writes a fresh marker that identifies `dir` as the scratchpad of `sessionId`; also counts as a use. */
export const writeMarker = (dir: string, sessionId: string, cwd: string, forkedFrom?: string): void => {
  const marker: Marker = {
    version: 1,
    sessionId,
    cwd,
    createdAt: new Date().toISOString(),
    ...(forkedFrom == null ? {} : { forkedFrom }),
  };

  writeFileAtomic(join(dir, MARKER), `${JSON.stringify(marker, null, 2)}\n`);
};
