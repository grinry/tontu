# Tontu working instructions

## Before working

- Read [docs/README.md](./docs/README.md), then the root and app/package documents relevant to the task.
- Read the affected app/package's `AGENTS.md` and `CLAUDE.md`. Check `.claude`, `.cursor`, and `.agents` for relevant instructions.
- Treat implementation as evidence of current behavior. If docs disagree, identify the discrepancy and update the relevant docs with an authorized change.
- An investigation request authorizes diagnosis, not implementing a fix; ask before fixing.

## Working rules

- Use pnpm 10.32.1 and Node 24.19.0. Pin dependency versions and use the root lockfile. Do not mix package managers.
- Ask before adding production dependencies or committing, unless the human has already explicitly authorized that action for the task.
- Follow [coding rules](./docs/coding-rules.md): domain boundaries, shared code ownership, const patterns, and documentation maintenance.
- Features belong to domains. A domain must not import another domain, including through barrel exports, aliases, dynamic imports, or type-only imports. Reused features belong in app-local `shared/` or an actual shared workspace package.
- Keep helpers, types, and constants split by responsibility. One or two small local definitions may stay beside their only consumer.
- Backend routes call services; services call repositories. Keep SQL and query builders in repositories, except justified migrations, test fixtures, and truly small non-reusable infrastructure operations.
- Make database writes rollback safe. Use transactions for operations that must succeed together and pass the same transaction through the participating repositories.
- Keep credentials and server-only dependencies out of mobile/client code.

## Finish the task

- Run `pnpm check` and builds relevant to the changed behavior. Exercise affected application paths.
- Update affected documentation in the same change: structure, runtime/infrastructure, coding rules, API behavior, database/migrations, and operational commands.
- Update documentation indexes and AGENTS.md links when adding or moving documents. New apps/packages need `docs/`, `AGENTS.md`, and a `CLAUDE.md` that references AGENTS.md.
- Do not copy root rules into every app. Link to root rules and document local specifics in the owning scope.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
