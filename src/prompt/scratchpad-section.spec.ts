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
    expect(text).toContain(
      'The scratchpad survives context compaction: for multi-step work, keep your plan, key decisions and progress there as plain Markdown notes and update them as phases complete. The final answer (or error) of each subagent the main agent starts with the Agent tool is saved automatically as agents/<type in lowercase>-<first 8 characters of its agent ID>.md; answers of workflow or nested subagents are not saved, so request a result file when you need them after a compaction. After a compaction you receive an index of the scratchpad files (paths, authors, titles; no contents); read the ones relevant to your current task as far as your rules allow.'
    );
    expect(text).not.toContain('You are subagent');
  });

  it('should route all communication through the orchestrator', () => {
    const text = scratchpadSection('/d');

    expect(text).toContain(
      "The scratchpad is shared storage, not a channel between subagents: each subagent gets its inputs from its task prompt and returns its results to the orchestrator that delegated the task, which keeps the full picture and decides what each subagent sees. When you delegate, you are the orchestrator: pass relevant findings or paths of finished scratchpad files explicitly, preferring paths over copying large content; if one subagent needs another's output, start it after that output has returned to you. Your task prompt then decides whether the subagent writes result files; request one, with its path, only when the output is large or needed later."
    );
    expect(text).not.toContain('other agents may need');
  });

  it('should add the child instruction with a label', () =>
    expect(scratchpadSection('/d', 'explore-13f6f836')).toContain(
      'You are subagent explore-13f6f836; if the text above contains another "You are subagent" paragraph, it belongs to your parent and this one is yours. Within the scratchpad, this paragraph takes precedence for you, but it never grants write permission: if your instructions forbid creating files, create none. Address everything to the agent that delegated your task, through a self-contained final answer in the format your task asks for, otherwise a condensed summary of your findings, including open questions and unresolved conflicts, plus the paths of any result files you wrote, without repeating their contents; leave no messages or handoff files for other agents. Read only scratchpad files that your task names, that you wrote, or that your own subagents report; skip other index entries even if they look relevant. Write result files only when your task asks for them, at the path it gives, otherwise under /d/agents/explore-13f6f836/; keep any working notes and temporary files there as well.'
    ));

  it('should not grant write permission to read-only subagents', () =>
    expect(scratchpadSection('/d', 'explore-13f6f836')).toContain(
      'it never grants write permission: if your instructions forbid creating files, create none.'
    ));

  it('should restrict subagent reads to named, own and own-subagent files', () => {
    const text = scratchpadSection('/d', 'explore-13f6f836');

    expect(text).toContain(
      'Read only scratchpad files that your task names, that you wrote, or that your own subagents report'
    );
    expect(text).not.toContain('You may read any file');
  });

  it('should hand over only finished files between subagents', () =>
    expect(scratchpadSection('/d')).toContain(
      "if one subagent needs another's output, start it after that output has returned to you"
    ));

  it('should not let subagents decide on their own to write result files', () =>
    expect(scratchpadSection('/d', 'explore-13f6f836')).not.toContain('put large outputs there'));
});
