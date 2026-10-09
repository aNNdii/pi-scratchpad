import { mkdtempSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readLastUse } from './read-last-use';
import { MARKER } from './store-constants';
import { writeMarker } from './write-marker';

const createDir = (): string => mkdtempSync(join(tmpdir(), 'sp-last-use-'));

describe('readLastUse', () => {
  it('should return the marker mtime of a scratchpad', () => {
    const dir = createDir();
    writeMarker(dir, 's', '/w');
    utimesSync(join(dir, MARKER), 1000, 1000);

    expect(readLastUse(dir)).toBe(1_000_000);
  });

  it('should return undefined without a marker', () => expect(readLastUse(createDir())).toBeUndefined());

  it('should return undefined for an invalid marker', () => {
    const dir = createDir();
    writeFileSync(join(dir, MARKER), '{ nope');

    expect(readLastUse(dir)).toBeUndefined();
  });

  it('should return undefined for a symlinked marker', () => {
    const source = createDir();
    const dir = createDir();
    writeMarker(source, 's', '/w');
    symlinkSync(join(source, MARKER), join(dir, MARKER));

    expect(readLastUse(dir)).toBeUndefined();
  });
});
