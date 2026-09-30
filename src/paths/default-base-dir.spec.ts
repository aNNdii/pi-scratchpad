import { describe, expect, it } from 'vitest';

import { defaultBaseDir } from './default-base-dir';

describe('defaultBaseDir', () => {
  it('should use /tmp/pi-<uid> on Linux', () => expect(defaultBaseDir('linux', 1000, '/var/tmp')).toBe('/tmp/pi-1000'));

  it('should ignore $TMPDIR on macOS', () =>
    expect(defaultBaseDir('darwin', 501, '/var/folders/x')).toBe('/tmp/pi-501'));

  it(String.raw`should use %TEMP%\pi on Windows`, () =>
    expect(defaultBaseDir('win32', undefined, String.raw`C:\Temp`)).toMatch(/Temp[\\/]pi$/)
  );
});
