import { findCandidates } from './find-candidates';
import { removeScratchpads } from './remove-scratchpads';

const DAY_MS = 86_400_000;

/** Deletes scratchpads unused for more than `ttlDays`. `ttlDays === 0` disables cleanup. */
export const cleanupExpired = (
  baseDir: string,
  ttlDays: number,
  protectedDirs: Set<string>,
  now: number = Date.now()
): string[] => {
  if (ttlDays <= 0) return [];

  const cutoff = now - ttlDays * DAY_MS;
  const expired = findCandidates(baseDir, protectedDirs).filter(candidate => candidate.lastUseMs < cutoff);

  return removeScratchpads(
    baseDir,
    expired.map(candidate => candidate.dir)
  );
};
