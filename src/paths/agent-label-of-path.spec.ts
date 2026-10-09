import { describe, expect, it } from 'vitest';

import { agentLabelOfPath } from './agent-label-of-path';
import { agentResultFile } from './agent-result-file';
import { agentWorkDir } from './agent-work-dir';

describe('agentLabelOfPath', () => {
  it('should attribute a result file to its agent', () =>
    expect(agentLabelOfPath('agents/explore-13f6f836.md')).toBe('explore-13f6f836'));

  it('should attribute files in an agent folder to that agent', () =>
    expect(agentLabelOfPath('agents/explore-13f6f836/notes.md')).toBe('explore-13f6f836'));

  it('should not attribute other files to an agent', () => expect(agentLabelOfPath('notes/api.md')).toBeUndefined());
  it('should not attribute a bare agents file to an agent', () => expect(agentLabelOfPath('agents')).toBeUndefined());

  it('should recognize the paths it builds', () => {
    expect(agentLabelOfPath(agentResultFile('', 'explore-1').replaceAll('\\', '/'))).toBe('explore-1');
    expect(agentLabelOfPath(`${agentWorkDir('', 'explore-1').replaceAll('\\', '/')}/x.md`)).toBe('explore-1');
  });
});
