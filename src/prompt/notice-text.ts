export type NoticeKind = 'lost' | 'fork-failed';

/** One-time notices about the scratchpad state (spec §8). */
export const noticeText = (kind: NoticeKind, dir: string): string => {
  if (kind === 'lost') {
    return `The scratchpad ${dir} was deleted (TTL or OS cleanup) and has been recreated empty; earlier files are gone.`;
  }

  return `The source session's scratchpad could not be copied; ${dir} starts empty.`;
};
