import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { prepareRootDir } from './prepare-root-dir';
import { resetRootDir } from './reset-root-dir';
import { MARKER } from './store-constants';

describe('resetRootDir', () => {
  it('should empty the directory and keep a marker', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'sp-reset-')), 's1');
    prepareRootDir({ dir, sessionId: 's1', cwd: '/w', hadScratchpad: false });
    writeFileSync(join(dir, 'x.md'), 'x');
    resetRootDir(dir, 's1', '/w');

    expect(readdirSync(dir)).toEqual([MARKER]);
  });
});
