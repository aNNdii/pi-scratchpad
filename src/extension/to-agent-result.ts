import type { AgentResult } from '../store';

const optionalString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

/** Reads a `subagents:completed` / `subagents:failed` payload; returns `undefined` for unusable payloads. */
export const toAgentResult = (data: unknown): AgentResult | undefined => {
  if (typeof data !== 'object' || data == null) return undefined;

  const { id, type, description, status, result, error } = data as Record<string, unknown>;
  if (typeof id !== 'string' || typeof type !== 'string') return undefined;

  return {
    id,
    type,
    description: optionalString(description),
    status: optionalString(status),
    result: optionalString(result),
    error: optionalString(error),
  };
};
