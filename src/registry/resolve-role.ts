import type { Registry } from './registry';

export type RoleInput = {
  reason: string;
  parentSession?: string;
  hasSessionFile: boolean;
};

export type ResolvedRole = { role: 'root' } | { role: 'child'; dir: string };

/**
 * Decides whether a starting session is a root session with its own scratchpad or a subagent that
 * shares the scratchpad of a live session in this process. Only `startup` sessions can be children:
 * either their `parentSession` is registered, or they are in-memory and exactly one root is active.
 */
export const resolveRole = (input: RoleInput, registry: Registry): ResolvedRole => {
  if (input.reason !== 'startup') return { role: 'root' };

  const parent = input.parentSession == null ? undefined : registry.get(input.parentSession);
  if (parent != null) return { role: 'child', dir: parent.dir };

  if (input.hasSessionFile) return { role: 'root' };

  const [onlyRoot, ...otherRoots] = registry.activeRoots();
  if (onlyRoot != null && otherRoots.length === 0) return { role: 'child', dir: onlyRoot.dir };

  return { role: 'root' };
};
