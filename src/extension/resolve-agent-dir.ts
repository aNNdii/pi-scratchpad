import { homedir } from 'node:os';
import { join } from 'node:path';

type PiModule = { getAgentDir?: () => string };

/** pi's agent directory (respects `PI_CODING_AGENT_DIR`), with a fallback when pi's export is unavailable. */
export const resolveAgentDir = async (): Promise<string> => {
  try {
    const { getAgentDir }: PiModule = await import('@earendil-works/pi-coding-agent');
    if (typeof getAgentDir === 'function') return getAgentDir();
  } catch {
    // Fall back below.
  }

  return process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi', 'agent');
};
