import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

import { resolveAgentDir, setupScratchpad } from './extension';

export default async function scratchpadExtension(pi: ExtensionAPI): Promise<void> {
  setupScratchpad(pi, { agentDir: await resolveAgentDir() });
}
