export type Marker = {
  version: 1;
  sessionId: string;
  cwd: string;
  createdAt: string;
  forkedFrom?: string;
};

export const createMarker = (sessionId: string, cwd: string, forkedFrom?: string): Marker => ({
  version: 1,
  sessionId,
  cwd,
  createdAt: new Date().toISOString(),
  ...(forkedFrom == null ? {} : { forkedFrom }),
});
