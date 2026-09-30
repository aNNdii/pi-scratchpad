import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import { expandHome } from '../paths';

export type ConfigSource = {
  baseDir?: string;
  ttlDays?: number;
};

export const resolveConfigPath = (value: string, relativeTo: string, home: string): string => {
  const expanded = expandHome(value, home);

  return isAbsolute(expanded) ? expanded : resolve(relativeTo, expanded);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value != null && !Array.isArray(value);

/** Reads one `scratchpad.json`; invalid content is reported in `warnings` and ignored. */
export const readConfigSource = (file: string, home: string, warnings: string[]): ConfigSource => {
  if (!existsSync(file)) return {};

  let raw: unknown;

  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    warnings.push(`Ignoring ${file}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);

    return {};
  }

  if (!isRecord(raw)) {
    warnings.push(`Ignoring ${file}: expected a JSON object`);

    return {};
  }

  const source: ConfigSource = {};
  const { baseDir, ttlDays } = raw;

  if (typeof baseDir === 'string' && baseDir.trim() !== '')
    source.baseDir = resolveConfigPath(baseDir, dirname(file), home);
  else if (baseDir != null) warnings.push(`Ignoring baseDir in ${file}: expected a non-empty string`);

  if (typeof ttlDays === 'number' && Number.isInteger(ttlDays) && ttlDays >= 0) source.ttlDays = ttlDays;
  else if (ttlDays != null) warnings.push(`Ignoring ttlDays in ${file}: expected a non-negative integer`);

  return source;
};
