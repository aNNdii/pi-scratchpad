import { Registry } from './registry';

const REGISTRY_KEY = Symbol.for('pi-scratchpad:registry');

/** Process-global registry shared by all extension instances (parent and subagent sessions). */
export const getRegistry = (): Registry => {
  const store = globalThis as Record<symbol, Registry | undefined>;
  const existing = store[REGISTRY_KEY];
  if (existing != null) return existing;

  const registry = new Registry();
  store[REGISTRY_KEY] = registry;

  return registry;
};
