/** Registry key of a session: its file path, or `mem:<id>` for in-memory sessions. */
export const sessionKey = (sessionFile: string | undefined, sessionId: string): string =>
  sessionFile ?? `mem:${sessionId}`;
