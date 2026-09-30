import { describe, expect, it } from 'vitest';

import { Registry } from './registry';

describe('Registry', () => {
  it('should track active roots and dirs', () => {
    const registry = new Registry();
    registry.register('/p.jsonl', { dir: '/d', role: 'root' });
    registry.register('/c.jsonl', { dir: '/d', role: 'child', label: 'explore-1' });

    expect(registry.activeRootKeys()).toEqual(['/p.jsonl']);
    expect(registry.activeDirs()).toEqual(new Set(['/d']));
  });

  it('should unregister idempotently', () => {
    const registry = new Registry();
    registry.register('/p.jsonl', { dir: '/d', role: 'root' });
    registry.unregister('/p.jsonl');
    registry.unregister('/p.jsonl');

    expect(registry.activeRootKeys()).toEqual([]);
  });
});
