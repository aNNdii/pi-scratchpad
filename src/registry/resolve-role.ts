import type { Registry } from './registry';

export type RoleInput = {
  reason: string;
  parentSession?: string;
  hasSessionFile: boolean;
};

export type ResolvedRole = { role: 'root' } | { role: 'child'; dir: string };

/** Decides whether a starting session is a root session or a subagent of a live session (spec §7). */
export const resolveRole = (input: RoleInput, registry: Registry): ResolvedRole => {
  if (input.reason !== 'startup') return { role: 'root' };

  const parent = input.parentSession == null ? undefined : registry.get(input.parentSession);
  if (parent != null) return { role: 'child', dir: parent.dir };

  if (input.hasSessionFile) return { role: 'root' };

  const [onlyRoot, ...otherRoots] = registry.activeRootKeys();
  const root = onlyRoot == null ? undefined : registry.get(onlyRoot);
  if (root != null && otherRoots.length === 0) return { role: 'child', dir: root.dir };

  return { role: 'root' };
};
