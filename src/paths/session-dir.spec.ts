import { describe, expect, it } from 'vitest';

import { sessionDir } from './session-dir';

describe('sessionDir', () => {
  it('should join base, slug and session id', () => expect(sessionDir('/b', '/w/p', 'abc')).toBe('/b/-w-p/abc'));
});
