import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';

import { isBookkeepingFile } from './is-bookkeeping-file';
import { MARKER } from './store-constants';
import { temporaryPath } from './temporary-path';

describe('isBookkeepingFile', () => {
  it('should recognize the marker', () => expect(isBookkeepingFile(MARKER)).toBe(true));

  it('should recognize temp files of atomic writes', () =>
    expect(isBookkeepingFile(basename(temporaryPath('/d/notes.md')))).toBe(true));

  it.each(['notes.md', 'notes.tmp', '.notes.tmp', 'draft.123.tmp'])('should treat %s as content', name =>
    expect(isBookkeepingFile(name)).toBe(false)
  );
});
