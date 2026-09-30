import { mkdtempSync, statSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { prepareRootDir } from './prepare-root-dir';
import { MARKER } from './store-constants';
import { touchMarker } from './touch-marker';

describe('touchMarker', () => {
  it('should update the marker mtime', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'sp-touch-')), 's1');
    prepareRootDir({ dir, sessionId: 's1', cwd: '/w', hadScratchpad: false });
    utimesSync(join(dir, MARKER), new Date(0), new Date(0));
    touchMarker(dir);

    expect(statSync(join(dir, MARKER)).mtimeMs).toBeGreaterThan(0);
  });
});
