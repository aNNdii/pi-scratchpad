import { formatSize } from './format-size';
import { DEFAULT_INDEX_LIMITS, type IndexEntry, type IndexLimits } from './index-entry';

const byteLength = (text: string): number => Buffer.byteLength(text);

/**
 * Renders the index text: a header and one line per entry, cut off after `limits.maxEntries` lines or
 * before exceeding `limits.maxBytes`, with a trailing line that counts the omitted entries.
 */
export const renderIndex = (dir: string, entries: IndexEntry[], limits: IndexLimits = DEFAULT_INDEX_LIMITS): string => {
  const header =
    `Scratchpad index for ${dir} — ${entries.length} files, newest first. ` +
    'File contents are not included; read a file when it is relevant.';

  const moreLine = (count: number): string => `… and ${count} more files — run \`ls -R ${dir}\`.`;

  let text = header;
  let shown = 0;

  for (const entry of entries) {
    if (shown >= limits.maxEntries) break;

    const line = `- ${entry.path} · ${entry.author} · "${entry.title}" · ${formatSize(entry.size)}`;
    const candidate = `${text}\n${line}`;
    const remaining = entries.length - shown - 1;
    const reserve = remaining > 0 ? byteLength(`\n${moreLine(remaining)}`) : 0;

    if (byteLength(candidate) + reserve > limits.maxBytes) break;

    text = candidate;
    shown += 1;
  }

  if (shown < entries.length) text += `\n${moreLine(entries.length - shown)}`;

  return text;
};
