import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readMarker } from './read-marker';
import { MARKER } from './store-constants';

describe('readMarker', () => {
  it('should return undefined without a marker', () =>
    expect(readMarker(mkdtempSync(join(tmpdir(), 'sp-marker-')))).toBeUndefined());

  it('should return undefined for invalid JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-marker-'));
    writeFileSync(join(dir, MARKER), '{ nope');

    expect(readMarker(dir)).toBeUndefined();
  });

  it('should return undefined for a foreign JSON document', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-marker-'));
    writeFileSync(join(dir, MARKER), JSON.stringify({ version: 2, sessionId: 's' }));

    expect(readMarker(dir)).toBeUndefined();
  });
});
