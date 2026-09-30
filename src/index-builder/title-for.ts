const TITLE_MAX_LENGTH = 100;
const TITLE_SCAN_LINES = 20;
const HEADING_PATTERN = /^#{1,6}\s+\S/;
const HEADING_PREFIX_PATTERN = /^#{1,6}\s+/;

/** First Markdown heading in the first 20 lines, else the first non-empty line; `(binary)` for binary data. */
export const titleFor = (head: Buffer): string => {
  if (head.includes(0)) return '(binary)';

  const lines = head.toString('utf8').split(/\r?\n/).slice(0, TITLE_SCAN_LINES);
  const heading = lines.find(line => HEADING_PATTERN.test(line));

  const title =
    heading == null ? (lines.find(line => line.trim() !== '') ?? '') : heading.replace(HEADING_PREFIX_PATTERN, '');

  return title.trim().slice(0, TITLE_MAX_LENGTH);
};
