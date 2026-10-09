import { existsSync, readFileSync } from 'node:fs';

import { agentLabel, agentResultFile } from '../paths';

import { writeFileAtomic } from './write-file-atomic';

export type AgentResult = {
  id: string;
  type: string;
  description?: string;
  status?: string;
  result?: string;
  error?: string;
};

const formatResultBlock = (result: AgentResult, now: Date): string => {
  const description = result.description?.trim();
  const title = description == null || description === '' ? `${result.type} ${result.id.slice(0, 8)}` : description;
  const body = result.error != null && result.result == null ? `Error: ${result.error}` : (result.result ?? '').trim();

  return [
    `# ${title}`,
    '',
    `- Agent: ${result.type} ${result.id}`,
    `- Status: ${result.status ?? 'unknown'}`,
    `- Finished: ${now.toISOString()}`,
    '',
    body,
    '',
  ].join('\n');
};

/** Persists a subagent result as `agents/<type>-<id8>.md`; repeated results are appended. */
export const saveAgentResult = (dir: string, result: AgentResult, now: Date = new Date()): string => {
  const file = agentResultFile(dir, agentLabel(result.type, result.id));
  const block = formatResultBlock(result, now);
  const previous = existsSync(file) ? readFileSync(file, 'utf8') : undefined;

  writeFileAtomic(file, previous == null ? block : `${previous.trimEnd()}\n\n---\n\n${block}`);

  return file;
};
