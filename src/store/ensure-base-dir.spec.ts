import { mkdirSync, mkdtempSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { ensureBaseDir } from './ensure-base-dir';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sp-base-'));
});

describe('ensureBaseDir', () => {
  it('should create the base with mode 0700', () => {
    const base = join(root, 'base');
    ensureBaseDir(base);

    expect(statSync(base).mode & 0o777).toBe(0o700);
  });

  it('should accept an existing own directory', () => expect(() => ensureBaseDir(root)).not.toThrow());

  it('should reject a symlink', () => {
    mkdirSync(join(root, 'real'));
    symlinkSync(join(root, 'real'), join(root, 'link'));

    expect(() => ensureBaseDir(join(root, 'link'))).toThrow(/symlink/);
  });

  it('should reject a dangling symlink', () => {
    symlinkSync(join(root, 'missing'), join(root, 'link'));

    expect(() => ensureBaseDir(join(root, 'link'))).toThrow(/symlink/);
  });

  it('should reject a file', () => {
    writeFileSync(join(root, 'file'), 'x');

    expect(() => ensureBaseDir(join(root, 'file'))).toThrow(/not a directory/);
  });
});
