/** Content of the marker file (`MARKER`) of a scratchpad. */
export type Marker = {
  version: 1;
  sessionId: string;
  cwd: string;
  createdAt: string;
  forkedFrom?: string;
};
