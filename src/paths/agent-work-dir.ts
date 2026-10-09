import { join } from 'node:path';

import { AGENTS_DIR } from './paths-constants';

/** Folder for the result files and notes of one subagent: `<dir>/agents/<label>`. */
export const agentWorkDir = (dir: string, label: string): string => join(dir, AGENTS_DIR, label);
