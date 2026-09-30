import { lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Marker } from './marker';
import { MARKER } from './store-constants';

const isMarker = (value: unknown): value is Marker =>
  typeof value === 'object' &&
  value != null &&
  (value as Partial<Marker>).version === 1 &&
  typeof (value as Partial<Marker>).sessionId === 'string';

/** Reads the marker of a scratchpad; missing, non-regular or invalid markers yield `undefined`. */
export const readMarker = (dir: string): Marker | undefined => {
  const path = join(dir, MARKER);

  try {
    if (!lstatSync(path).isFile()) return undefined;

    const data: unknown = JSON.parse(readFileSync(path, 'utf8'));

    return isMarker(data) ? data : undefined;
  } catch {
    return undefined;
  }
};
