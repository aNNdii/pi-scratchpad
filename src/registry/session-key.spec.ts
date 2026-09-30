import { describe, expect, it } from 'vitest';

import { sessionKey } from './session-key';

describe('sessionKey', () => {
  it('should use the session file', () => expect(sessionKey('/s/a.jsonl', 'a')).toBe('/s/a.jsonl'));
  it('should use mem:<id> without a file', () => expect(sessionKey(undefined, 'a')).toBe('mem:a'));
});
