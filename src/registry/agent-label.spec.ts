import { describe, expect, it } from 'vitest';

import { agentLabel } from './agent-label';

describe('agentLabel', () => {
  it('should combine type and id prefix', () =>
    expect(agentLabel('general-purpose', '21de996f-4f16-420')).toBe('general-purpose-21de996f'));

  it('should keep parallel agents of one type distinct', () =>
    expect(agentLabel('Explore', '13f6f836-1')).not.toBe(agentLabel('Explore', 'a1634082-1')));

  it('should fall back to agent for an empty type', () => expect(agentLabel('!!', 'abcdefgh1')).toBe('agent-abcdefgh'));
});
