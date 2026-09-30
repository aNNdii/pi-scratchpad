import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';

import type { ScratchpadConfig } from '../config';
import { sessionDir } from '../paths';
import { noticeText } from '../prompt';
import type { Registry } from '../registry';
import { ensureBaseDir, prepareRootDir, readSessionHeader } from '../store';

import { INIT_ENTRY, NOTICE_MESSAGE } from './custom-types';
import type { ScratchpadState } from './scratchpad-state';

export type StartRootSessionOptions = {
  pi: Pick<ExtensionAPI, 'appendEntry' | 'sendMessage'>;
  ctx: Pick<ExtensionContext, 'cwd' | 'sessionManager'>;
  registry: Registry;
  config: ScratchpadConfig;
  key: string;
  sessionId: string;
  parentSession?: string;
};

const hasInitEntry = (ctx: StartRootSessionOptions['ctx'], sessionId: string): boolean =>
  ctx.sessionManager
    .getEntries()
    .some(
      entry =>
        entry.type === 'custom' &&
        entry.customType === INIT_ENTRY &&
        (entry.data as { sessionId?: unknown } | undefined)?.sessionId === sessionId
    );

const resolveForkSource = (baseDir: string, sessionId: string, parentSession?: string) => {
  const header = parentSession == null ? undefined : readSessionHeader(parentSession);
  if (header == null || header.id === sessionId) return undefined;

  return { dir: sessionDir(baseDir, header.cwd, header.id), sessionId: header.id };
};

/** Prepares the scratchpad of a root session and registers it (spec §8). */
export const startRootSession = (options: StartRootSessionOptions): ScratchpadState => {
  const { pi, ctx, registry, config, key, sessionId, parentSession } = options;

  ensureBaseDir(config.baseDir);

  const dir = sessionDir(config.baseDir, ctx.cwd, sessionId);
  const hadScratchpad = hasInitEntry(ctx, sessionId);
  const forkSource = resolveForkSource(config.baseDir, sessionId, parentSession);
  const status = prepareRootDir({ dir, sessionId, cwd: ctx.cwd, hadScratchpad, forkSource });

  if (!hadScratchpad) pi.appendEntry(INIT_ENTRY, { sessionId, dir });

  if (status === 'recreated' || status === 'fork-failed') {
    const content = noticeText(status === 'recreated' ? 'lost' : 'fork-failed', dir);

    pi.sendMessage({ customType: NOTICE_MESSAGE, content, display: true });
  }

  registry.register(key, { dir, role: 'root' });

  return { key, sessionId, cwd: ctx.cwd, dir, role: 'root', config };
};
