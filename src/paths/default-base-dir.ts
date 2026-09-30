import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Default scratchpad base: `/tmp/pi-<uid>` on POSIX (like Claude Code), `%TEMP%\pi` on Windows. */
export const defaultBaseDir = (
  platform: NodeJS.Platform = process.platform,
  uid: number | undefined = process.getuid?.(),
  temporaryDirectory: string = tmpdir()
): string => {
  if (platform === 'win32') return join(temporaryDirectory, 'pi');

  return `/tmp/pi-${uid ?? 'user'}`;
};
