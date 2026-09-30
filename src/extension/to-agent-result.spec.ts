import { describe, expect, it } from 'vitest';

import { toAgentResult } from './to-agent-result';

describe('toAgentResult', () => {
  it('should read a tintinweb payload', () =>
    expect(toAgentResult({ id: 'a', type: 'Explore', result: 'r', toolUses: 3 })).toEqual({
      id: 'a',
      type: 'Explore',
      description: undefined,
      status: undefined,
      result: 'r',
      error: undefined,
    }));

  it('should reject a payload without id', () => expect(toAgentResult({ type: 'Explore' })).toBeUndefined());
  it('should reject a non-object payload', () => expect(toAgentResult('x')).toBeUndefined());
});
