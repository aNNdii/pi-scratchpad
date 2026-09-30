import { describe, expect, it } from 'vitest';

import { Registry } from './registry';
import { resolveRole } from './resolve-role';

const createRegistry = (...roots: [key: string, dir: string][]) => {
  const registry = new Registry();

  for (const [key, dir] of roots) registry.register(key, { dir, role: 'root' });

  return registry;
};

describe('resolveRole', () => {
  it.each(['new', 'resume', 'fork', 'reload'])('should treat reason %s as root even with a live parent', reason => {
    const registry = createRegistry(['/p.jsonl', '/d']);

    expect(resolveRole({ reason, parentSession: '/p.jsonl', hasSessionFile: true }, registry)).toEqual({
      role: 'root',
    });
  });

  it('should resolve a child from a live parentSession', () => {
    const registry = createRegistry(['/p.jsonl', '/d']);

    expect(resolveRole({ reason: 'startup', parentSession: '/p.jsonl', hasSessionFile: true }, registry)).toEqual({
      role: 'child',
      dir: '/d',
    });
  });

  it('should treat an unregistered parentSession (CLI fork) as root', () =>
    expect(resolveRole({ reason: 'startup', parentSession: '/o.jsonl', hasSessionFile: true }, new Registry())).toEqual(
      {
        role: 'root',
      }
    ));

  it('should treat an in-memory session without active roots as root', () =>
    expect(resolveRole({ reason: 'startup', hasSessionFile: false }, new Registry())).toEqual({ role: 'root' }));

  it('should treat an in-memory session as child of the only active root', () =>
    expect(resolveRole({ reason: 'startup', hasSessionFile: false }, createRegistry(['/a.jsonl', '/a']))).toEqual({
      role: 'child',
      dir: '/a',
    }));

  it('should treat an in-memory session as root when several roots are active', () => {
    const registry = createRegistry(['/a.jsonl', '/a'], ['/b.jsonl', '/b']);

    expect(resolveRole({ reason: 'startup', hasSessionFile: false }, registry)).toEqual({ role: 'root' });
  });
});
