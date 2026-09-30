export type IndexEntry = {
  /** Path relative to the scratchpad root, with `/` separators. */
  path: string;
  size: number;
  mtimeMs: number;
  author: string;
  title: string;
};

export type IndexLimits = {
  maxEntries: number;
  maxBytes: number;
};

export const DEFAULT_INDEX_LIMITS: IndexLimits = { maxEntries: 50, maxBytes: 8192 };
