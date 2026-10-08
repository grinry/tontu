# Coding rules

## Domain boundaries and shared code

Organize each feature under `src/domains/<domain>/`. A domain owns its routes/screens, services, repositories or data access, tests, and local types/helpers. Do not create global feature directories that mix unrelated domains.

A domain must not import another domain. This includes imports from public indexes, type-only imports, dynamic imports, path aliases, and re-exports that indirectly bypass the boundary. Only an app's composition root may wire multiple domains together; it lives outside `domains/` and imports their deliberate public entry points.

If a feature is reused or needs to be imported by multiple domains, put its implementation and public contract in app-local `src/shared/`. Shared modules must not import domain implementations or act as re-export shortcuts into them. Keep shared code organized by responsibility, such as `shared/config` and `shared/database`.

When multiple apps actually need the same client-safe implementation or contract, create an explicit workspace package under `packages/`. Do not import one app's source from another. A package may not import app source. Keep backend credentials, database connections, and server dependencies out of packages consumed by mobile.

Expose a domain through its `index.ts`; do not expose everything by default. Avoid generic repositories/services or new abstractions without real reuse. Prefer plain functions and injected dependencies when that is sufficient.

## Code style

Use Biome for formatting and linting. Match nearby code, prefer `const` patterns over TypeScript enums, and reference meaningful constants rather than repeating magic strings/numbers. Do not extract incidental one-off literals solely to create extra files.

Keep files focused on a domain and responsibility. Split helpers, types, constants, and similar definitions into suitable files when there are more than one or two small local definitions. Keep tests alongside the code they verify. Use strict TypeScript, runtime validation at untrusted boundaries, and parameterized SQL.

## Backend layers and writes

Application HTTP routes call services. Services implement use cases and call repositories. Repositories own SQL/query builders and database persistence. Routes must not import a database client or repository directly; services must not contain queries.

Direct database operations outside repositories are exceptions: migration/schema code, test setup/assertions, and truly small one-time/non-reusable infrastructure operations that do not warrant a repository. Explain a non-obvious exception beside the operation and in the owning docs if it becomes an established practice. Repeated operations must move into a repository.

Make writes rollback safe. Use a transaction when multiple writes implement one operation, when reads/checks and subsequent writes must preserve an invariant, or when a partial result would be invalid. Services own the transaction boundary; repositories receive and use the same transaction executor. A single atomic statement does not need a redundant transaction wrapper.

Do not start independent nested transactions in repositories. Let failures escape the transaction callback so the driver rolls back; map errors at the service/API boundary afterward. Add database constraints and appropriate locking/isolation when concurrency can violate an invariant. Do not hold a database transaction open across network or AI calls; stage those calls before it or use a separate durable delivery design when necessary.

## Documentation workflow

Before editing, read the root docs index and the affected app/package index. Consult structure, infrastructure, and coding documents relevant to the change.

During the change, update the documentation in the owning scope whenever behavior, file ownership, environment variables, commands, persistence, deployment, API contracts, or rules change. Document what is implemented and clearly distinguish future work or recommendations. Keep command examples runnable.

Before finishing, check the changed files against the docs, fix stale paths/commands, and update indexes and AGENTS.md links. New apps/packages need `docs/README.md`, structure/infrastructure/coding docs, AGENTS.md, and CLAUDE.md referencing AGENTS.md. Keep docs changes with the implementation; do not leave maintenance for a later task.
