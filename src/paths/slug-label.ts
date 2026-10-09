/** Lowercases and replaces every run of non-`[a-z0-9]` characters with `-`. */
export const slugLabel = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
