import { join } from 'node:path';

import { cwdSlug } from './cwd-slug';

/** Scratchpad directory of one root session: `<baseDir>/<cwd-slug>/<session-id>`. */
export const sessionDir = (baseDir: string, cwd: string, sessionId: string): string =>
  join(baseDir, cwdSlug(cwd), sessionId);
