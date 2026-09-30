import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';

import { cleanupExpired } from '../cleanup';
import { loadConfig } from '../config';
import { buildIndexText } from '../index-builder';
import { scratchpadSection } from '../prompt';
import { getRegistry, labelFromSessionName, resolveRole, sessionKey } from '../registry';
import { saveAgentResult, touchMarker } from '../store';

import { INDEX_MESSAGE, PROMPT_SECTION } from './custom-types';
import { errorMessage } from './error-message';
import { runScratchpadCommand } from './run-scratchpad-command';
import type { ScratchpadState } from './scratchpad-state';
import { startRootSession } from './start-root-session';
import { toAgentResult } from './to-agent-result';

export type ScratchpadDependencies = {
  agentDir: string;
};

const warn = (ctx: Pick<ExtensionContext, 'hasUI' | 'ui'>, message: string): void => {
  if (ctx.hasUI) ctx.ui.notify(`Scratchpad: ${message}`, 'warning');
};

/** Wires the scratchpad to pi events (spec §8–§9). */
export const setupScratchpad = (pi: ExtensionAPI, dependencies: ScratchpadDependencies): void => {
  const registry = getRegistry();
  let state: ScratchpadState | undefined;

  const protectedDirs = (): Set<string> => {
    const dirs = registry.activeDirs();
    if (state != null) dirs.add(state.dir);

    return dirs;
  };

  const scheduleCleanup = (ctx: ExtensionContext, baseDir: string, ttlDays: number): void => {
    const timer = setTimeout(() => {
      try {
        cleanupExpired(baseDir, ttlDays, protectedDirs());
      } catch (error) {
        warn(ctx, `cleanup failed: ${errorMessage(error)}`);
      }
    }, 0);

    timer.unref();
  };

  pi.on('session_start', (event, ctx) => {
    state = undefined;

    try {
      const config = loadConfig({ cwd: ctx.cwd, agentDir: dependencies.agentDir });

      for (const warning of config.warnings) warn(ctx, warning);

      const sessionId = ctx.sessionManager.getSessionId();
      const sessionFile = ctx.sessionManager.getSessionFile();
      const parentSession = ctx.sessionManager.getHeader()?.parentSession;
      const key = sessionKey(sessionFile, sessionId);
      const role = resolveRole({ reason: event.reason, parentSession, hasSessionFile: sessionFile != null }, registry);

      if (role.role === 'child') {
        state = { key, sessionId, cwd: ctx.cwd, dir: role.dir, role: 'child', config };
        registry.register(key, { dir: role.dir, role: 'child' });

        return;
      }

      state = startRootSession({ pi, ctx, registry, config, key, sessionId, parentSession });
      scheduleCleanup(ctx, config.baseDir, config.ttlDays);
    } catch (error) {
      state = undefined;
      warn(ctx, `unavailable for this session (${errorMessage(error)})`);
    }
  });

  pi.on('before_agent_start', event => {
    if (state == null) return;

    const label = state.role === 'child' ? labelFromSessionName(pi.getSessionName(), state.sessionId) : undefined;

    event.systemPromptOptions.sections = {
      ...event.systemPromptOptions.sections,
      [PROMPT_SECTION]: scratchpadSection(state.dir, label),
    };
  });

  pi.on('agent_end', () => {
    if (state?.role !== 'root') return;

    try {
      touchMarker(state.dir);
    } catch {
      // The marker is gone; the next session start recreates it.
    }
  });

  const onAgentResult = (data: unknown): void => {
    const result = toAgentResult(data);
    if (state?.role !== 'root' || result == null) return;

    try {
      saveAgentResult(state.dir, result);
    } catch {
      // The result stays available through the subagent tools; nothing to surface here.
    }
  };

  pi.events.on('subagents:completed', onAgentResult);
  pi.events.on('subagents:failed', onAgentResult);

  pi.on('session_compact', () => {
    if (state == null) return;

    let content: string;

    try {
      content = buildIndexText(state.dir);
    } catch {
      content = `Scratchpad directory: ${state.dir} (index unavailable; list it with ls when relevant).`;
    }

    // `triggerTurn: false`: while the agent streams, pi defers the message to the end of the turn
    // instead of steering it in, which would start an extra model turn after the run.
    pi.sendMessage({ customType: INDEX_MESSAGE, content, display: false }, { triggerTurn: false });
  });

  pi.on('session_shutdown', () => {
    if (state != null) registry.unregister(state.key);

    state = undefined;
  });

  pi.registerCommand('scratchpad', {
    description: 'Show the session scratchpad index, or clean scratchpads: clean [--all|--current]',
    handler: (args, ctx) => {
      runScratchpadCommand(args, ctx, state, protectedDirs());

      return Promise.resolve();
    },
  });
};
