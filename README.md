# Tontu

pnpm workspaces + Turborepo, with a Mastra API server and Expo mobile app.

## Start

Use Node **24.19.0** and pnpm **10.32.1** (both pinned). With nvm:

```sh
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

The API and Mastra Studio run at `http://localhost:4111`. Expo prints the device/simulator options. `GET /v1/health` checks the database connection. The mobile starter has a **Check backend** button.

Local development requires no Docker, database service, or AI key. PGlite stores data in `apps/backend/.data/pglite`. Each data directory is owned by one running process: stop the backend before running migrations against that directory.

Environment files are optional. To customize settings:

```sh
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env
```

For a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address, such as `http://192.168.1.20:4111`. Without this variable, the mobile app defaults to localhost on iOS and `10.0.2.2` on the Android emulator. Backend `HOST` defaults to `0.0.0.0` for device access.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start both apps |
| `pnpm dev:backend` / `pnpm dev:mobile` | Start one app |
| `pnpm check` | Biome, TypeScript, and backend database tests |
| `pnpm lint:fix` / `pnpm format` | Apply Biome fixes / formatting |
| `pnpm build` | Build the server and export Android/iOS JS bundles |
| `pnpm db:migrate` | Apply pending migrations to the configured database |
| `pnpm --filter @tontu/backend start` | Start the built backend |
| `pnpm --filter @tontu/mobile ios` / `android` | Start Expo with a simulator/emulator |
| `pnpm --filter @tontu/mobile build:ios` / `build:android` | Compile local native release builds; requires Xcode / Android SDK |

Turbo caches builds and checks; development servers are persistent and uncached. `EXPO_PUBLIC_API_URL` participates in the mobile build cache. Public Expo variables are embedded in bundles; never put secrets in them.

`pnpm build` exports Hermes bundles, **not signed store binaries**. `apps/mobile/eas.json` also includes preview and production cloud build profiles. For EAS builds, link the app to your Expo account/project and configure signing, then run EAS CLI from `apps/mobile`. The initial bundle identifiers are `com.grinry.tontu`; change them before registering the app if needed.

## Database

Kysely uses its built-in PGlite dialect locally and the `pg` PostgreSQL driver whenever `DATABASE_URL` is set. Both use PostgreSQL SQL and the same migration files. PostgreSQL server extensions and production behavior still require validation against the actual production database.

`NODE_ENV=production` **requires** a PostgreSQL `DATABASE_URL`; it cannot silently use PGlite. Configure SSL through your database provider's connection URL using verified certificates. The pool has a 10-second connection timeout. The server closes database connections during graceful shutdown.

Table interfaces belong in `apps/backend/src/database/schema.ts`; migration files belong in `src/database/migrations` with sortable names, such as `20261008_001_create_users.ts`. No business tables have been invented for this starter. The first migration run initializes Kysely's migration history tables.

A migration exports `up`, and optionally `down`:

```ts
import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (column) => column.primaryKey())
    .addColumn("name", "text", (column) => column.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("users").execute();
}
```

Run migrations separately before launching the backend. Keep migration files immutable once applied and update the table interfaces with each schema change. A source checkout with development dependencies is needed to run the migration CLI; the standalone server bundle does not contain that CLI.

## Mastra

The API server uses Mastra's server and custom route support. A starter assistant is available when you set `MASTRA_MODEL=provider/model` and the matching provider API key in the backend environment. For example, the `.env.example` shows OpenAI configuration. Leave `MASTRA_MODEL` unset to run the API without an AI provider. Provider credentials stay on the backend.

Application database storage is configured through Kysely. Persistent Mastra conversation memory/workflow storage is not configured yet; add it when those features are needed.

## Layout

```text
apps/
  backend/
    src/api/          # HTTP routes
    src/config/       # Environment validation
    src/database/     # Kysely, table types, migrations
    src/mastra/       # Mastra runtime and agents
  mobile/
    App.tsx
    src/api/          # Backend requests
    src/config/       # Public client configuration
```

Dependencies are pinned and one root `pnpm-lock.yaml` manages both apps. Biome is the formatter and linter; add shared packages when there is concrete reuse.
