# Backend working instructions

Read the repository's [AGENTS.md](../../AGENTS.md) and [coding rules](../../docs/coding-rules.md), then [backend docs](./docs/README.md).

- Organize product features under `src/domains/<domain>/`. No cross-domain imports. Reused implementation belongs in `src/shared/`; the composition root wires domain public entry points.
- Application routes call services; services call repositories. Queries belong in repositories. Migrations, test fixtures, and justified one-time infrastructure operations are exceptions.
- Services coordinate rollback-safe writes and transaction boundaries. Pass the same transaction into repositories; do not query through a global connection inside a transaction.
- The backend owns its HTTP server. Core application routes and database services must work without Mastra loaded. Keep AI integration in its own domain and mount it separately.
- Kysely uses PGlite locally and PostgreSQL in production. Update table types and immutable migration files together. Stop the local server before migrating its PGlite directory.
- Run `pnpm --filter @tontu/backend typecheck`, `test`, and `build` for backend changes; run root `pnpm check` before completion.
- Update [structure](./docs/structure.md), [infrastructure](./docs/infrastructure.md), [database](./docs/database.md), and [coding rules](./docs/coding-rules.md) when their owned behavior changes.
