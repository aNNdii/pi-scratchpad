import { join } from 'node:path';

/** System-prompt section announcing the scratchpad (spec §9.1). */
export const scratchpadSection = (dir: string, childLabel?: string): string => {
  const lines = [
    `Scratchpad directory: ${dir} — always use it for temporary files (intermediate results, scripts, outputs that don't belong in the project) instead of /tmp or other system temp directories; it is session-specific, isolated from the project, and can generally be used without permission prompts. Only use /tmp if the user explicitly asks.`,
    'The scratchpad is shared with all subagents of this session and survives context compaction. Use it for durable findings that you or other agents may need later — prefer plain Markdown files. Results of subagents are saved automatically under agents/. After a compaction you receive an index of its files; read a file when it is relevant.',
  ];

  if (childLabel != null) {
    lines.push(
      `You are subagent ${childLabel}. If your instructions allow writing files, write your own files under ${join(dir, 'agents', childLabel)}/ and name their paths in your final answer. You may read any file in the scratchpad.`
    );
  }

  return lines.join('\n');
};
