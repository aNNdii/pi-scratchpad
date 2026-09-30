import { homedir } from 'node:os';
import { join } from 'node:path';

import { defaultBaseDir } from '../paths';

import { CONFIG_FILE, DEFAULT_TTL_DAYS, ENV_BASE_DIR } from './config-constants';
import { readConfigSource, resolveConfigPath } from './read-config-source';

export type ScratchpadConfig = {
  baseDir: string;
  ttlDays: number;
  warnings: string[];
};

export type LoadConfigOptions = {
  cwd: string;
  agentDir: string;
  env?: Record<string, string | undefined>;
  home?: string;
  defaultBase?: string;
};

/** Resolves the configuration: env > project `.pi/scratchpad.json` > global `<agentDir>/scratchpad.json` > defaults. */
export const loadConfig = (options: LoadConfigOptions): ScratchpadConfig => {
  const home = options.home ?? homedir();
  const env = options.env ?? process.env;
  const warnings: string[] = [];

  const project = readConfigSource(join(options.cwd, '.pi', CONFIG_FILE), home, warnings);
  const global = readConfigSource(join(options.agentDir, CONFIG_FILE), home, warnings);

  const envBase = env[ENV_BASE_DIR]?.trim();
  const envBaseDir = envBase == null || envBase === '' ? undefined : resolveConfigPath(envBase, options.cwd, home);

  const baseDir = envBaseDir ?? project.baseDir ?? global.baseDir ?? options.defaultBase ?? defaultBaseDir();
  const ttlDays = project.ttlDays ?? global.ttlDays ?? DEFAULT_TTL_DAYS;

  return { baseDir, ttlDays, warnings };
};
