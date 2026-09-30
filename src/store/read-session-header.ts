import { closeSync, openSync, readSync } from 'node:fs';

export type SessionHeader = {
  id: string;
  cwd: string;
};

const HEADER_BYTES = 64 * 1024;

const isSessionHeader = (value: unknown): value is SessionHeader & { type: 'session' } => {
  const header = value as Partial<SessionHeader & { type: string }> | null;

  return header?.type === 'session' && typeof header.id === 'string' && typeof header.cwd === 'string';
};

const readFirstLine = (file: string): string => {
  const descriptor = openSync(file, 'r');

  try {
    const buffer = Buffer.alloc(HEADER_BYTES);
    const length = readSync(descriptor, buffer, 0, HEADER_BYTES, 0);
    const [firstLine = ''] = buffer.subarray(0, length).toString('utf8').split('\n', 1);

    return firstLine;
  } finally {
    closeSync(descriptor);
  }
};

/** Reads `{ id, cwd }` from the header line of a pi session file. */
export const readSessionHeader = (file: string): SessionHeader | undefined => {
  try {
    const header: unknown = JSON.parse(readFirstLine(file));

    return isSessionHeader(header) ? { id: header.id, cwd: header.cwd } : undefined;
  } catch {
    return undefined;
  }
};
