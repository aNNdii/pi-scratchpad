import { DEFAULT_INDEX_LIMITS, type IndexLimits } from './index-entry';
import { listEntries } from './list-entries';
import { renderIndex } from './render-index';

export const buildIndexText = (dir: string, limits: IndexLimits = DEFAULT_INDEX_LIMITS): string =>
  renderIndex(dir, listEntries(dir), limits);
