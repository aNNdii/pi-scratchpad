import type { ExtensionCommandContext } from '@earendil-works/pi-coding-agent';

import { cleanupAll, cleanupExpired } from '../cleanup';
import { buildIndexText } from '../index-builder';
import { resetRootDir } from '../store';

import { errorMessage } from './error-message';
import type { ScratchpadState } from './scratchpad-state';

export const COMMAND_USAGE = 'Usage: /scratchpad [clean [--all|--current]]';

const runClean = (
  state: ScratchpadState,
  option: string | undefined,
  protectedDirs: Set<string>
): string | undefined => {
  const { baseDir, ttlDays } = state.config;

  switch (option) {
    case undefined: {
      if (ttlDays <= 0) {
        return 'TTL cleanup is disabled (ttlDays is 0); nothing was deleted. Use `/scratchpad clean --all` to delete all inactive scratchpads.';
      }

      const deleted = cleanupExpired(baseDir, ttlDays, protectedDirs);

      return `Deleted ${deleted.length} scratchpad(s) unused for more than ${ttlDays} days.`;
    }
    case '--all': {
      const deleted = cleanupAll(baseDir, protectedDirs);

      return `Deleted ${deleted.length} scratchpad(s); active sessions were kept.`;
    }
    case '--current': {
      resetRootDir(state.dir, state.sessionId, state.cwd);

      return `Emptied ${state.dir}.`;
    }
    default: {
      return undefined;
    }
  }
};

/**
 * Handles `/scratchpad [clean [--all|--current]]`: without arguments it shows the index; `clean`
 * deletes scratchpads unused for more than `ttlDays`, `--all` every inactive one, `--current` empties
 * this session's scratchpad. Never deletes the scratchpads in `protectedDirs`.
 */
export const runScratchpadCommand = (
  args: string,
  ctx: Pick<ExtensionCommandContext, 'ui'>,
  state: ScratchpadState | undefined,
  protectedDirs: Set<string>
): void => {
  if (state == null) {
    ctx.ui.notify('Scratchpad is not available in this session.', 'warning');

    return;
  }

  const [command, option, ...rest] = args.trim().split(/\s+/).filter(Boolean);

  try {
    if (command == null) {
      ctx.ui.notify(buildIndexText(state.dir), 'info');

      return;
    }

    const message = command === 'clean' && rest.length === 0 ? runClean(state, option, protectedDirs) : undefined;

    ctx.ui.notify(message ?? COMMAND_USAGE, message == null ? 'warning' : 'info');
  } catch (error) {
    ctx.ui.notify(`Scratchpad command failed: ${errorMessage(error)}`, 'warning');
  }
};
