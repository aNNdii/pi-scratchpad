import { describe, expect, it } from 'vitest';

import { labelFromSessionName } from './label-from-session-name';

describe('labelFromSessionName', () => {
  it('should parse tintinweb session names', () =>
    expect(labelFromSessionName('Explore#13f6f836', 'x')).toBe('explore-13f6f836'));

  it('should fall back to the session id suffix', () =>
    expect(labelFromSessionName('my agent', '01a0f18c-00a3-760f-8048-4f6ca772617f')).toBe('agent-a772617f'));

  it('should fall back without a name', () => expect(labelFromSessionName(undefined, 'abc')).toBe('agent-abc'));
});
