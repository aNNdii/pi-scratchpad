import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { saveAgentResult } from './save-agent-result';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sp-result-'));
});

describe('saveAgentResult', () => {
  it('should write the result file', () => {
    const now = new Date('2026-09-30T10:00:00.000Z');

    const result = {
      id: '13f6f836-1686-486',
      type: 'Explore',
      description: 'Find auth',
      status: 'completed',
      result: 'Found it.',
    };

    const file = saveAgentResult(root, result, now);

    expect(file).toBe(join(root, 'agents', 'explore-13f6f836.md'));

    expect(readFileSync(file, 'utf8')).toBe(
      '# Find auth\n\n- Agent: Explore 13f6f836-1686-486\n- Status: completed\n- Finished: 2026-09-30T10:00:00.000Z\n\nFound it.\n'
    );
  });

  it('should append repeated results', () => {
    const result = { id: '13f6f836', type: 'Explore', status: 'error', error: 'boom' };
    const file = saveAgentResult(root, result);
    saveAgentResult(root, { ...result, status: 'completed', result: 'ok' });

    const text = readFileSync(file, 'utf8');

    expect(text).toContain('Error: boom');
    expect(text).toContain('\n---\n\n# Explore 13f6f836');
    expect(text.trimEnd().endsWith('ok')).toBe(true);
  });
});
