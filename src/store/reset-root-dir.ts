import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { createMarker } from './marker';
import { writeMarker } from './write-marker';

/** Deletes all scratchpad content and writes a fresh marker. */
export const resetRootDir = (dir: string, sessionId: string, cwd: string): void => {
  for (const name of readdirSync(dir)) rmSync(join(dir, name), { recursive: true, force: true });

  writeMarker(dir, createMarker(sessionId, cwd));
};
