import { homedir } from 'node:os';
import { join } from 'node:path';

/** Expands a leading `~` to the home directory. */
export const expandHome = (path: string, home: string = homedir()): string => {
  if (path === '~') return home;

  if (path.startsWith('~/') || path.startsWith('~\\')) return join(home, path.slice(2));

  return path;
};
