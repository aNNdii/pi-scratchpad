import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname } from 'node:path';

import { isBookkeepingFile } from './is-bookkeeping-file';
import { isSymlink } from './is-symlink';
import { readMarker } from './read-marker';
import { DIRECTORY_MODE } from './store-constants';
import { touchMarker } from './touch-marker';
import { writeMarker } from './write-marker';

export type PrepareStatus = 'existing' | 'created' | 'recreated' | 'forked' | 'fork-failed';

export type PrepareOptions = {
  dir: string;
  sessionId: string;
  cwd: string;
  /** The session recorded a scratchpad before (a `scratchpad:init` entry with its own id). */
  hadScratchpad: boolean;
  /** Scratchpad of the session this one was forked from. */
  forkSource?: { dir: string; sessionId: string };
};

const createEmptyDir = (dir: string, sessionId: string, cwd: string): void => {
  mkdirSync(dir, { recursive: true, mode: DIRECTORY_MODE });
  writeMarker(dir, sessionId, cwd);
};

const copyForkSource = (options: PrepareOptions & { forkSource: { dir: string; sessionId: string } }): void => {
  const { dir, sessionId, cwd, forkSource } = options;
  if (readMarker(forkSource.dir) == null) throw new Error('Fork source has no scratchpad');

  mkdirSync(dirname(dir), { recursive: true, mode: DIRECTORY_MODE });
  cpSync(forkSource.dir, dir, {
    recursive: true,
    filter: source => !isSymlink(source) && !isBookkeepingFile(basename(source)),
  });
  writeMarker(dir, sessionId, cwd, forkSource.sessionId);
};

/**
 * Creates, reuses or fork-copies the scratchpad of a root session and reports what happened:
 * `existing` (reused; marker repaired or touched), `recreated` (the session had a scratchpad that is
 * gone, e.g. after TTL or OS cleanup), `created`, `forked` (copied from the source session without
 * symlinks and bookkeeping files) or `fork-failed` (copy failed; starts empty instead).
 */
export const prepareRootDir = (options: PrepareOptions): PrepareStatus => {
  const { dir, sessionId, cwd, hadScratchpad, forkSource } = options;

  if (existsSync(dir)) {
    if (readMarker(dir) == null) writeMarker(dir, sessionId, cwd);
    else touchMarker(dir);

    return 'existing';
  }

  if (hadScratchpad) {
    createEmptyDir(dir, sessionId, cwd);

    return 'recreated';
  }

  if (forkSource == null) {
    createEmptyDir(dir, sessionId, cwd);

    return 'created';
  }

  try {
    copyForkSource({ ...options, forkSource });

    return 'forked';
  } catch {
    rmSync(dir, { recursive: true, force: true });
    createEmptyDir(dir, sessionId, cwd);

    return 'fork-failed';
  }
};
