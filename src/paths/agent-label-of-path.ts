import { AGENTS_DIR } from './paths-constants';

const AGENT_PATH_PATTERN = new RegExp(`^${AGENTS_DIR}/([^/]+?)(?:\\.md)?(?:/|$)`);

/**
 * Label of the subagent that owns a scratchpad-relative path (`/` separators): `agents/<label>.md`
 * and everything below `agents/<label>/`. Returns `undefined` for files of the main agent.
 */
export const agentLabelOfPath = (relativePath: string): string | undefined =>
  AGENT_PATH_PATTERN.exec(relativePath)?.[1];
