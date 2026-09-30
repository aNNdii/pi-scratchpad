# pi-scratchpad

A [pi](https://pi.dev) extension that gives every session a scratchpad directory, modeled on
Claude Code's scratchpad:

- The system prompt of the main agent and of every
  [`@tintinweb/pi-subagents`](https://pi.dev/packages/@tintinweb/pi-subagents) subagent announces
  the same directory.
- The final answer (or error) of every top-level Agent-tool subagent is saved automatically as
  `agents/<type>-<id8>.md`; workflow and nested subagents are not saved.
- The scratchpad is shared storage, not a channel between subagents: all communication goes
  through the orchestrator (see [How agents use it](#how-agents-use-it)).
- After a compaction the agent receives an index of the scratchpad files (path, author, title,
  size; no contents) and reads what it needs.

## How agents use it

```
                    ┌─────────────────────────────────────┐
                    │      Orchestrator (main agent)      │
                    │ reads everything, keeps plan/notes  │
                    └──┬───────────▲───────────────┬──────┘
  1) task: findings,   │           │ 2) final      │ 3) task for B, only after A
     paths, optional   │           │    answer     │    has answered: summary or
     result-file path  ▼           │               ▼    path of a finished file
                ┌──────────────┐   │        ┌──────────────┐
                │  Subagent A  │───┘        │  Subagent B  │──▶ final answer
                └──────┬───────┘            └──────┬───────┘
                       └───────────────────────────┘
                           ✗ no direct exchange,
                             no handoff files
```

The system prompt sets these rules:

| Role         | Rules                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestrator | Keeps plan, key decisions and progress as Markdown notes. Passes findings or paths of finished files in the task prompt; starts a subagent that needs another's output only after that output has returned. Decides whether a subagent writes a result file, and where.                                                                              |
| Subagent     | Answers only the agent that delegated its task, with a self-contained final answer (summary, open questions, paths of result files). Reads only files its task names, files it wrote, or reports of its own subagents. Writes result files only when asked, at the given path or under `agents/<label>/`, and keeps notes and temporary files there. |
| Read-only    | The prompt never grants write permission: agents whose instructions forbid files (e.g. `Explore`, `Plan`) write nothing.                                                                                                                                                                                                                             |
| Nested       | A subagent that delegates is the orchestrator of its own subagents.                                                                                                                                                                                                                                                                                  |
| Extension    | Saves the final answer (or error) of every top-level Agent-tool subagent as `agents/<type>-<id8>.md`; workflow and nested subagents are not saved. Injects the file index after each compaction.                                                                                                                                                     |

## Install

```bash
pi install npm:@anndii/pi-scratchpad
# or straight from GitHub
pi install git:github.com/aNNdii/pi-scratchpad
```

## Layout

```
<baseDir>/<cwd-slug>/<session-id>/
  .pi-scratchpad            marker (used for safe cleanup)
  <main agent files>
  agents/<type>-<id8>.md    saved subagent results
  agents/<type>-<id8>/      files written by that subagent (convention)
```

Resumed sessions reuse their directory, forks get a copy, `/new` starts empty.

## Configuration

| Setting   | Source (highest first)                                                              | Default                                  |
| --------- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| `baseDir` | `PI_SCRATCHPAD_DIR`, `<project>/.pi/scratchpad.json`, `~/.pi/agent/scratchpad.json` | `/tmp/pi-<uid>` (`%TEMP%\pi` on Windows) |
| `ttlDays` | `<project>/.pi/scratchpad.json`, `~/.pi/agent/scratchpad.json`                      | `14` (`0` disables automatic cleanup)    |

```json
{ "baseDir": "~/.pi/agent/scratchpad", "ttlDays": 30 }
```

## Commands

- `/scratchpad` — show the path and the index.
- `/scratchpad clean` — delete scratchpads unused for more than `ttlDays`.
- `/scratchpad clean --all` — delete all scratchpads except those of active sessions.
- `/scratchpad clean --current` — empty the current session's scratchpad.

Cleanup only deletes directories carrying a valid `.pi-scratchpad` marker and never follows symlinks.

## Development

```bash
pnpm install
pnpm test      # Vitest with coverage
pnpm verify    # tsc
pnpm lint      # Oxlint (type-aware)
pnpm format    # Oxfmt, then lint autofix
```

Source layout: one folder per topic under `src/`, one exported function per file, colocated
`*.spec.ts` tests. See `AGENTS.md` for conventions.
