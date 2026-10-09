import { MARKER } from './store-constants';
import { TEMPORARY_NAME_PATTERN } from './temporary-path';

/** Whether a file name belongs to the store's own bookkeeping (marker, in-flight atomic writes) rather than to scratchpad content. */
export const isBookkeepingFile = (name: string): boolean => name === MARKER || TEMPORARY_NAME_PATTERN.test(name);
