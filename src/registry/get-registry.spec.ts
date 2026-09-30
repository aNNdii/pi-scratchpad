import { describe, expect, it } from 'vitest';

import { getRegistry } from './get-registry';

describe('getRegistry', () => {
  it('should return one instance', () => expect(getRegistry()).toBe(getRegistry()));

  it('should store the instance under the global symbol', () =>
    expect((globalThis as Record<symbol, unknown>)[Symbol.for('pi-scratchpad:registry')]).toBe(getRegistry()));
});
