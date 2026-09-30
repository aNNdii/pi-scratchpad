const AGENT_PATH_PATTERN = /^agents\/([^/]+?)(?:\.md)?(?:\/|$)/;

/** `agents/<label>.md` and `agents/<label>/…` belong to that subagent; everything else to the main agent. */
export const authorFor = (relativePath: string): string => {
  if (relativePath === 'agents') return 'main';

  const [, label] = AGENT_PATH_PATTERN.exec(relativePath) ?? [];

  return label ?? 'main';
};
