import { describe, expect, it } from 'vitest';

import { scratchpadSection } from './scratchpad-section';

describe('scratchpadSection', () => {
  it('should contain the Claude Code sentence', () =>
    expect(scratchpadSection('/tmp/pi-1/-w/s1')).toContain(
      "Scratchpad directory: /tmp/pi-1/-w/s1 — always use it for temporary files (intermediate results, scripts, outputs that don't belong in the project) instead of /tmp or other system temp directories;"
    ));

  it('should contain the durable-findings guidance', () => {
    const text = scratchpadSection('/d');

    expect(text).toContain('Only use /tmp if the user explicitly asks.');
    expect(text).toContain('Results of subagents are saved automatically under agents/.');
    expect(text).not.toContain('You are subagent');
  });

  it('should add the child instruction with a label', () =>
    expect(scratchpadSection('/d', 'explore-13f6f836')).toContain(
      'You are subagent explore-13f6f836. If your instructions allow writing files, write your own files under /d/agents/explore-13f6f836/ and name their paths in your final answer. You may read any file in the scratchpad.'
    ));
});
