import type { ScratchpadConfig } from '../config';
import type { Role } from '../registry';

/** Scratchpad state of one extension instance (one pi session). */
export type ScratchpadState = {
  key: string;
  sessionId: string;
  cwd: string;
  dir: string;
  role: Role;
  config: ScratchpadConfig;
};
