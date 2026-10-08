# Database, repositories, and migrations

## Drivers and storage ownership

Kysely uses its built-in PGlite dialect locally and the pg/PostgreSQL dialect when DATABASE_URL is set. Production requires DATABASE_URL; it cannot silently fall back to PGlite. Configure verified TLS using the production provider's connection URL. The PostgreSQL pool currently allows ten connections and has a ten-second connection timeout.

Local PGlite stores data at apps/backend/.data/pglite by default, with parent directories created on first use. A data directory belongs to one process: stop the backend before applying migrations against that same directory. Tests create their own temporary directories and clean them up. PostgreSQL-specific extensions/concurrency/production behavior must still be validated against actual PostgreSQL.

Application storage is independent from Mastra conversation/workflow storage, which has not been configured.

## Schema and migrations

Table interfaces live in `src/shared/database/schema.ts`; explicit, sortable migration files live in `src/shared/database/migrations/`. There are currently no application business tables. Kysely initializes migration history tables when `pnpm db:migrate` runs.

A migration exports `up(db: Kysely<unknown>)` and optionally `down`. Use a sortable name such as `20261008_001_create_users.ts`. Keep applied migrations immutable. Change table interfaces and migration files together, and test migration failure/rollback behavior when schema changes are meaningful. Prefer compatibility-safe schema changes that account for existing data and deployment order.

The CLI runs from a source checkout using Node's TypeScript support. It is a separate operation, not an automatic side effect of application startup. Both drivers use the same migration files. Direct schema/query operations in migrations and database tests are documented exceptions to repository-only application queries.

## Repositories and rollback-safe writes

Application SQL and Kysely queries belong in domain-owned repositories. Services own use cases and transaction boundaries; HTTP routes call services. The health repository is the current read-only example.

For a multi-write or invariant-sensitive operation, the service starts `db.transaction().execute(...)`, passes the transaction executor into each participating repository, and returns only after it commits. Repository write methods must use that passed executor, not a captured global connection. Let exceptions escape the callback to roll back every participating write.

A single atomic statement does not need a redundant transaction wrapper. Use a transaction for related writes, checks/read-modify-write sequences, or any operation where partial success would violate an invariant. Constraints and suitable locking/isolation remain necessary for concurrent writes. Avoid external network/AI requests inside transactions.

The existing database tests verify persisted data, transaction rollback, and migration-history reuse on restart. New business writes need tests for their actual failure and invariant cases. Do not invent a generic repository/unit-of-work framework until concrete use cases require one.

For a database operation outside repositories that is genuinely one-time and too small to warrant its own repository, explain the exception; move it into a repository if it becomes reusable.
