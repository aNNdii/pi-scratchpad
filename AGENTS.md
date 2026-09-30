# pi-scratchpad

A pi extension that gives every session a scratchpad directory shared with `@tintinweb/pi-subagents`
subagents, saves subagent results into it, and re-announces it with a file index after compaction.

Design: `docs/superpowers/specs/2026-09-30-scratchpad-design.md` (local only, not versioned). Approved specs are hard boundaries:
do not add validation, refactoring, dependencies or other unapproved work without explicit approval.

## Structure

- `src/index.ts` — pi entry point (default export).
- `src/extension/` — wiring to pi events and the `/scratchpad` command; the only code that uses pi types.
- `src/{config,paths,registry,store,index-builder,prompt,cleanup}/` — pure Node modules without pi runtime dependency.

Conventions follow YCM2 `packages/utilities`: one folder per topic, one exported function per kebab-case
file, a barrel `index.ts` per folder, colocated `*.spec.ts` tests named `should …`.

## TypeScript Conventions

- Use `value == null` / `value != null` for presence checks, not `=== undefined`.
- Prefer `export const fn = (…) => …` and `type` aliases.
- Make logical phases visible: blank lines around multiline statements, after early-return guards
  followed by siblings, and before a standalone `return`/`throw` with a preceding sibling. No lint
  rule enforces this; review the diff.
- Extension handlers must never throw into pi; degrade to "no scratchpad" and warn via `ctx.ui.notify`.

## Unit Tests

- Arrange scenario-specific fakes in the test, then pass them to the SUT.
- Filesystem tests use fresh `mkdtempSync` directories; never touch the real scratchpad base.

## Verification

Run from the repository root before reporting completion:

```bash
pnpm format && pnpm verify && pnpm test
```

`pnpm format` runs Oxfmt and then `pnpm lint:fix`, which ends with the read-only `pnpm lint`.

## Git

- No agent commits. Agents must never stage, commit or push; the user handles Git manually.

## Agent Model Selection

Every delegated agent task must explicitly select `claude-opus-5-5`. Do not use GPT models.
