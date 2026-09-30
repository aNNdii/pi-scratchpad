# pi-scratchpad

A [pi](https://pi.dev) extension that gives every session a scratchpad directory, modeled on
Claude Code's scratchpad:

- The system prompt of the main agent and of every
  [`@tintinweb/pi-subagents`](https://pi.dev/packages/@tintinweb/pi-subagents) subagent announces
  the same directory.
- Every top-level subagent result is saved automatically as `agents/<type>-<id>.md`.
- After a compaction the agent receives an index of the scratchpad files (path, author, title,
  size; no contents) and reads what it needs.

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
  agents/<type>-<id>.md     saved subagent results
  agents/<type>-<id>/       files written by that subagent (convention)
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
