import { findCandidates } from './find-candidates';
import { removeScratchpads } from './remove-scratchpads';

/** Deletes every scratchpad except the protected ones. */
export const cleanupAll = (baseDir: string, protectedDirs: Set<string>): string[] =>
  removeScratchpads(
    baseDir,
    findCandidates(baseDir, protectedDirs).map(candidate => candidate.dir)
  );
