const KIBIBYTE = 1024;
const MEBIBYTE = KIBIBYTE * KIBIBYTE;

export const formatSize = (bytes: number): string => {
  if (bytes < KIBIBYTE) return `${bytes} B`;

  if (bytes < MEBIBYTE) return `${(bytes / KIBIBYTE).toFixed(1)} KB`;

  return `${(bytes / MEBIBYTE).toFixed(1)} MB`;
};
