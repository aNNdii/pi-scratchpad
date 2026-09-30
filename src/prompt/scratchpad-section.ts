import { join } from 'node:path';

/** System-prompt section announcing the scratchpad (spec §9.1). */
export const scratchpadSection = (dir: string, childLabel?: string): string => {
  const lines = [
    `Scratchpad directory: ${dir} — always use it for temporary files (intermediate results, scripts, outputs that don't belong in the project) instead of /tmp or other system temp directories; it is session-specific, isolated from the project, and can generally be used without permission prompts. Only use /tmp if the user explicitly asks.`,
    'The scratchpad survives context compaction: for multi-step work, keep your plan, key decisions and progress there as plain Markdown notes and update them as phases complete. The final answer (or error) of each subagent the main agent starts with the Agent tool is saved automatically as agents/<type in lowercase>-<first 8 characters of its agent ID>.md; answers of workflow or nested subagents are not saved, so request a result file when you need them after a compaction. After a compaction you receive an index of the scratchpad files (paths, authors, titles; no contents); read the ones relevant to your current task as far as your rules allow.',
    "The scratchpad is shared storage, not a channel between subagents: each subagent gets its inputs from its task prompt and returns its results to the orchestrator that delegated the task, which keeps the full picture and decides what each subagent sees. When you delegate, you are the orchestrator: pass relevant findings or paths of finished scratchpad files explicitly, preferring paths over copying large content; if one subagent needs another's output, start it after that output has returned to you. Your task prompt then decides whether the subagent writes result files; request one, with its path, only when the output is large or needed later.",
  ];

  if (childLabel != null) {
    lines.push(
      `You are subagent ${childLabel}; if the text above contains another "You are subagent" paragraph, it belongs to your parent and this one is yours. Within the scratchpad, this paragraph takes precedence for you, but it never grants write permission: if your instructions forbid creating files, create none. Address everything to the agent that delegated your task, through a self-contained final answer in the format your task asks for, otherwise a condensed summary of your findings, including open questions and unresolved conflicts, plus the paths of any result files you wrote, without repeating their contents; leave no messages or handoff files for other agents. Read only scratchpad files that your task names, that you wrote, or that your own subagents report; skip other index entries even if they look relevant. Write result files only when your task asks for them, at the path it gives, otherwise under ${join(dir, 'agents', childLabel)}/; keep any working notes and temporary files there as well.`
    );
  }

  return lines.join('\n');
};
