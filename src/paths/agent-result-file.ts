import { join } from 'node:path';

import { AGENTS_DIR } from './paths-constants';

/** File that holds the saved final answers of one subagent: `<dir>/agents/<label>.md`. */
export const agentResultFile = (dir: string, label: string): string => join(dir, AGENTS_DIR, `${label}.md`);
