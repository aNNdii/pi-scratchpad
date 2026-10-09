import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { sessionDir } from '../paths';
import { getRegistry } from '../registry';
import { MARKER } from '../store';

import { setupScratchpad } from './setup-scratchpad';

type Handler = (event: any, ctx: any) => unknown;

type FakeContextOptions = {
  id: string;
  file?: string;
  parentSession?: string;
  entries?: unknown[];
};

let root: string;
let base: string;
let cwd: string;
let agentDir: string;

const createFakePi = (sessionName?: string) => {
  const handlers = new Map<string, Handler[]>();
  const busHandlers = new Map<string, ((data: unknown) => void)[]>();

  const pi = {
    sent: [] as { message: any; options: any }[],
    entries: [] as unknown[],
    commands: new Map<string, any>(),
    on: (name: string, handler: Handler) => handlers.set(name, [...(handlers.get(name) ?? []), handler]),
    events: {
      on: (name: string, handler: (data: unknown) => void) =>
        busHandlers.set(name, [...(busHandlers.get(name) ?? []), handler]),
      emit: (name: string, data: unknown) => {
        for (const handler of busHandlers.get(name) ?? []) handler(data);
      },
    },
    registerCommand: (name: string, options: unknown) => pi.commands.set(name, options),
    sendMessage: (message: unknown, options?: unknown) => pi.sent.push({ message, options }),
    appendEntry: (customType: string, data: unknown) => pi.entries.push({ type: 'custom', customType, data }),
    getSessionName: () => sessionName,
    // Handlers run sequentially in registration order, like pi's event dispatch.
    fire: (name: string, event: object, ctx: unknown) =>
      (handlers.get(name) ?? []).reduce<Promise<unknown>>(
        (previous, handler) => previous.then(() => handler({ type: name, ...event }, ctx)),
        Promise.resolve()
      ),
  };

  return pi;
};

const createFakeContext = (options: FakeContextOptions) => {
  const notes: string[] = [];

  return {
    notes,
    cwd,
    hasUI: true,
    ui: { notify: (message: string) => notes.push(message) },
    sessionManager: {
      getSessionId: () => options.id,
      getSessionFile: () => options.file,
      getHeader: () => ({ type: 'session', id: options.id, cwd, timestamp: 't', parentSession: options.parentSession }),
      getEntries: () => options.entries ?? [],
    },
  };
};

const startRoot = async (id: string, overrides: Partial<FakeContextOptions> = {}) => {
  const pi = createFakePi();
  const ctx = createFakeContext({ id, file: join(root, `${id}.jsonl`), ...overrides });

  setupScratchpad(pi as any, { agentDir });
  await pi.fire('session_start', { reason: 'startup' }, ctx);

  return { pi, ctx, dir: sessionDir(base, cwd, id) };
};

const readSection = async (pi: ReturnType<typeof createFakePi>, ctx: unknown) => {
  const event = { prompt: 'x', systemPrompt: '', systemPromptOptions: { sections: {} as Record<string, string> } };
  await pi.fire('before_agent_start', event, ctx);

  return event.systemPromptOptions.sections.scratchpad;
};

const shutdown = (session: { pi: ReturnType<typeof createFakePi>; ctx: unknown }) =>
  session.pi.fire('session_shutdown', { reason: 'quit' }, session.ctx);

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'sp-ext-'));
  base = join(root, 'base');
  cwd = join(root, 'project');
  agentDir = join(root, 'agent');

  mkdirSync(cwd);
  mkdirSync(agentDir);
  process.env.PI_SCRATCHPAD_DIR = base;
});

describe('setupScratchpad', () => {
  it('should create the dir, record init and announce the path on root start', async () => {
    const session = await startRoot('root1');

    expect(existsSync(join(session.dir, MARKER))).toBe(true);

    expect(session.pi.entries).toEqual([
      { type: 'custom', customType: 'scratchpad:init', data: { sessionId: 'root1', dir: session.dir } },
    ]);

    await expect(readSection(session.pi, session.ctx)).resolves.toContain(`Scratchpad directory: ${session.dir}`);
    await shutdown(session);
  });

  it('should share the parent dir with a child and add the child instruction', async () => {
    const parent = await startRoot('root2');
    const childPi = createFakePi('Explore#13f6f836');

    const childCtx = createFakeContext({
      id: 'c1',
      file: join(root, 'c1.jsonl'),
      parentSession: join(root, 'root2.jsonl'),
    });

    setupScratchpad(childPi as any, { agentDir });
    await childPi.fire('session_start', { reason: 'startup' }, childCtx);

    const section = await readSection(childPi, childCtx);

    expect(section).toContain(`Scratchpad directory: ${parent.dir}`);
    expect(section).toContain(`under ${join(parent.dir, 'agents', 'explore-13f6f836')}/`);
    expect(childPi.entries).toEqual([]);

    await shutdown({ pi: childPi, ctx: childCtx });
    await shutdown(parent);
  });

  it('should save subagent results on the root', async () => {
    const session = await startRoot('root3');
    session.pi.events.emit('subagents:completed', { id: '21de996f-4f16', type: 'general-purpose', result: 'done' });
    session.pi.events.emit('subagents:failed', { id: 'aaaabbbb-1', type: 'Explore', status: 'error', error: 'boom' });

    expect(readFileSync(join(session.dir, 'agents', 'general-purpose-21de996f.md'), 'utf8')).toContain('done');
    expect(readFileSync(join(session.dir, 'agents', 'explore-aaaabbbb.md'), 'utf8')).toContain('Error: boom');

    await shutdown(session);
  });

  it('should warn when a subagent result cannot be saved', async () => {
    const session = await startRoot('root8');
    writeFileSync(join(session.dir, 'agents'), 'not a folder');
    session.pi.events.emit('subagents:completed', { id: '21de996f-4f16', type: 'Explore', result: 'done' });

    expect(session.ctx.notes.at(-1)).toMatch(/could not save the result of Explore 21de996f-4f16/);

    await shutdown(session);
  });

  it('should explain that /scratchpad clean does nothing when ttlDays is 0', async () => {
    mkdirSync(join(cwd, '.pi'));
    writeFileSync(join(cwd, '.pi', 'scratchpad.json'), JSON.stringify({ ttlDays: 0 }));

    const session = await startRoot('root9');
    await session.pi.commands.get('scratchpad').handler('clean', session.ctx);

    expect(session.ctx.notes.at(-1)).toMatch(/TTL cleanup is disabled .*nothing was deleted/);

    await shutdown(session);
  });

  it('should send the index after compaction without triggering a turn', async () => {
    const session = await startRoot('root4');
    writeFileSync(join(session.dir, 'notes.md'), '# Notes');
    await session.pi.fire('session_compact', { reason: 'manual' }, session.ctx);

    const last = session.pi.sent.at(-1);

    expect(last?.message.customType).toBe('scratchpad-index');
    expect(last?.message.display).toBe(false);
    expect(last?.message.content).toContain('- notes.md · main · "Notes"');
    expect(last?.options).toEqual({ triggerTurn: false });

    await shutdown(session);
  });

  it('should notify when a known scratchpad was lost', async () => {
    const entries = [{ type: 'custom', customType: 'scratchpad:init', data: { sessionId: 'root5' } }];
    const session = await startRoot('root5', { entries });

    expect(session.pi.sent[0]?.message.customType).toBe('scratchpad-notice');
    expect(session.pi.sent[0]?.message.content).toContain('earlier files are gone');
    expect(session.pi.entries).toEqual([]);

    await shutdown(session);
  });

  it('should copy the scratchpad of a CLI fork source', async () => {
    const source = await startRoot('src1');
    writeFileSync(join(source.dir, 'finding.md'), '# F');
    await shutdown(source);
    writeFileSync(join(root, 'src1.jsonl'), `${JSON.stringify({ type: 'session', id: 'src1', cwd })}\n`);

    const fork = await startRoot('fork1', { parentSession: join(root, 'src1.jsonl') });

    expect(readFileSync(join(fork.dir, 'finding.md'), 'utf8')).toBe('# F');

    await shutdown(fork);
  });

  it('should degrade without throwing when the base dir is unsafe', async () => {
    mkdirSync(join(root, 'real'));
    symlinkSync(join(root, 'real'), join(root, 'link'));
    process.env.PI_SCRATCHPAD_DIR = join(root, 'link');

    const session = await startRoot('root6');

    expect(session.ctx.notes.join('\n')).toMatch(/symlink/);

    await expect(readSection(session.pi, session.ctx)).resolves.toBeUndefined();
    await session.pi.fire('session_compact', { reason: 'manual' }, session.ctx);

    expect(session.pi.sent).toEqual([]);

    await shutdown(session);
  });

  it('should show the index and empty the current scratchpad via /scratchpad', async () => {
    const session = await startRoot('root7');
    const command = session.pi.commands.get('scratchpad');
    writeFileSync(join(session.dir, 'x.md'), '# X');

    await command.handler('', session.ctx);

    expect(session.ctx.notes.at(-1)).toContain('x.md');

    await command.handler('clean --current', session.ctx);

    expect(readdirSync(session.dir)).toEqual([MARKER]);

    await command.handler('bogus', session.ctx);

    expect(session.ctx.notes.at(-1)).toMatch(/Usage/);

    await shutdown(session);

    expect(getRegistry().activeRoots()).toEqual([]);
  });
});
