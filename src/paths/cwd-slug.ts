/** Turns an absolute working directory into a single path segment. */
export const cwdSlug = (cwd: string): string => cwd.replaceAll(/[\\/.:]/g, '-');
