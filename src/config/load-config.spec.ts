import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { loadConfig, type LoadConfigOptions } from './load-config';

let cwd: string;
let agentDir: string;

const writeProject = (content: string) => {
  mkdirSync(join(cwd, '.pi'), { recursive: true });
  writeFileSync(join(cwd, '.pi', 'scratchpad.json'), content);
};

const writeGlobal = (content: string) => writeFileSync(join(agentDir, 'scratchpad.json'), content);

const createOptions = (overrides: Partial<LoadConfigOptions> = {}): LoadConfigOptions => ({
  cwd,
  agentDir,
  env: {},
  home: '/home/u',
  defaultBase: '/tmp/pi-1',
  ...overrides,
});

beforeEach(() => {
  const root = mkdtempSync(join(tmpdir(), 'sp-config-'));
  cwd = join(root, 'project');
  agentDir = join(root, 'agent');

  mkdirSync(cwd, { recursive: true });
  mkdirSync(agentDir, { recursive: true });
});

describe('loadConfig', () => {
  it('should fall back to defaults', () =>
    expect(loadConfig(createOptions())).toEqual({ baseDir: '/tmp/pi-1', ttlDays: 14, warnings: [] }));

  it('should apply env > project > global > default per key', () => {
    writeGlobal(JSON.stringify({ baseDir: '/g', ttlDays: 3 }));

    expect(loadConfig(createOptions())).toMatchObject({ baseDir: '/g', ttlDays: 3 });

    writeProject(JSON.stringify({ baseDir: '/p' }));

    expect(loadConfig(createOptions())).toMatchObject({ baseDir: '/p', ttlDays: 3 });

    expect(loadConfig(createOptions({ env: { PI_SCRATCHPAD_DIR: '/e' } }))).toMatchObject({
      baseDir: '/e',
      ttlDays: 3,
    });
  });

  it('should resolve relative paths against the declaring file', () => {
    writeProject(JSON.stringify({ baseDir: 'scratch' }));

    expect(loadConfig(createOptions()).baseDir).toBe(join(cwd, '.pi', 'scratch'));
  });

  it('should expand ~', () => {
    writeProject(JSON.stringify({ baseDir: '~/sp' }));

    expect(loadConfig(createOptions()).baseDir).toBe('/home/u/sp');
  });

  it('should resolve a relative env value against the cwd', () =>
    expect(loadConfig(createOptions({ env: { PI_SCRATCHPAD_DIR: 'rel' } })).baseDir).toBe(join(cwd, 'rel')));

  it('should warn on invalid JSON and fall through', () => {
    writeGlobal(JSON.stringify({ ttlDays: 7 }));
    writeProject('{ nope');

    const config = loadConfig(createOptions());

    expect(config.ttlDays).toBe(7);
    expect(config.warnings).toHaveLength(1);
  });

  it('should ignore a negative ttlDays', () => {
    writeGlobal(JSON.stringify({ ttlDays: 7 }));
    writeProject(JSON.stringify({ ttlDays: -1 }));

    expect(loadConfig(createOptions())).toMatchObject({ ttlDays: 7 });
  });

  it('should warn on each invalid value', () => {
    writeProject(JSON.stringify({ ttlDays: 1.5, baseDir: 42 }));

    expect(loadConfig(createOptions()).warnings).toHaveLength(2);
  });

  it('should accept ttlDays 0', () => {
    writeProject(JSON.stringify({ ttlDays: 0 }));

    expect(loadConfig(createOptions()).ttlDays).toBe(0);
  });
});
