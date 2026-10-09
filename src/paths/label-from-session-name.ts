import { agentLabel } from './agent-label';

const SESSION_NAME_PATTERN = /^(.+)#([0-9a-f]{8})$/;

/** Label from a subagent session name like `Explore#13f6f836`; falls back to `agent-<last 8 of session id>`. */
export const labelFromSessionName = (name: string | undefined, sessionId: string): string => {
  const match = name == null ? null : SESSION_NAME_PATTERN.exec(name);
  const [, type, id] = match ?? [];
  if (type != null && id != null) return agentLabel(type, id);

  return `agent-${sessionId.slice(-8)}`;
};
