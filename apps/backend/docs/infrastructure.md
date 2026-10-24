# Backend infrastructure and operations

## Commands

Run from the repository root with Node 24.19.0 and pnpm 10.32.1:

| Command | Behavior |
| --- | --- |
| `pnpm dev:backend` | Watch and run src/server.ts with Node's TypeScript support |
| `pnpm --filter @tontu/backend build` | Compile to dist/ using tsconfig.build.json |
| `pnpm --filter @tontu/backend start` | Run dist/server.js |
| `pnpm --filter @tontu/backend typecheck` | Check source and tests without emitting |
| `pnpm --filter @tontu/backend test` | Run API, configuration, and database tests |
| `pnpm db:migrate` | Apply pending migrations through the configured database driver |
| `pnpm --filter @tontu/backend studio` | Launch the separate Mastra Studio UI against the default API port/prefix |

The server build is ordinary TypeScript output, not `mastra build`. Production requires the compiled dist/ directory, package metadata, and production dependencies. Run from the backend app directory so relative configuration paths stay consistent. Run migrations from a source checkout with the tooling dependencies before starting the server.

## Environment

An optional backend .env is loaded using Node's built-in loader; existing process variables take precedence. Use .env.example as the starting point.

| Variable | Default / purpose |
| --- | --- |
| NODE_ENV | development; production requires PostgreSQL |
| HOST | 0.0.0.0; permits physical-device LAN access |
| PORT | 4111 |
| DATABASE_URL | When set, use pg/PostgreSQL; required in production |
| PGLITE_DATA_DIR | ./.data/pglite; local-only persistent data |
| MASTRA_STORAGE_PATH | ./.data/mastra.db; local memory/editor database; telemetry appends .observability.duckdb |
| MASTRA_MODEL | Unset: AI integration not loaded. Set provider/model to enable it |
| Provider key, e.g. OPENAI_API_KEY | Backend-only credential for the configured model |

Changing the API port also requires updating the mobile URL and Studio connection settings. The Studio script uses port 4111 and `/ai/api`; for a custom port run `pnpm --filter @tontu/backend exec mastra studio --server-port <port> --server-api-prefix /ai/api`.

## HTTP and lifecycle

`GET /v1/health` calls the health service/repository. It returns HTTP 200 with `{ "status": "ok", "database": "pglite" | "postgres" }` when the database responds, or HTTP 503 with `{ "status": "unavailable" }` without exposing database details.

The application owns its Hono server. MASTRA_MODEL enables a separate child app under `/ai`. Studio is started separately after enabling the integration; it is not served by the product API. The AI child app permits browser CORS from localhost/127.0.0.1 on Studio's default port 3000. Configure allowed origins explicitly if Studio is hosted elsewhere. No model/provider call is required for normal API startup and health checks.

When AI is enabled, `GET /` returns HTTP 200 with `{ "status": "ok" }` and permits the same local Studio origins. Studio probes this root URL before using `/ai/api`, so this response enables automatic server detection. It indicates server availability, not database or provider health; use `/v1/health` for database health. With AI disabled, the root remains unregistered. If Studio has a saved connection override, set its instance URL to `http://localhost:4111` and API prefix to `/ai/api` in Settings.

On SIGINT/SIGTERM the server stops accepting requests and gives existing HTTP connections five seconds to drain before force-closing them. It then shuts down optional Mastra workers and closes the application database. Startup failures close resources too. Watch-mode restarts use this same shutdown path.

## Deployment state

AI API CORS permits credentialed Studio requests only from the listed local Studio origins, including Studio's auth-capabilities request.

Use NODE_ENV=production with a PostgreSQL DATABASE_URL and provider-appropriate verified TLS. PGlite is prohibited as a production fallback. Authentication, production hosting, are not configured yet. Namespace separation is an ownership boundary, not authentication.

Update this document when configuration, startup/shutdown, packaging, routes, or operational commands change. Database-specific lifecycle and migrations belong in [database.md](./database.md).

## Mastra Studio features

Enabling AI configures MastraEditor with database-backed draft/published versions, agent memory with the latest 20 messages per thread (semantic recall disabled), and Observability with a storage exporter and its default sensitive-data filter. Studio provides editor, threads, traces, metrics, and logs. No external telemetry exporter is configured. Memory needs a stable thread/resource identity when calling the agent outside Studio.

Local storage uses libSQL for runtime/editor state and DuckDB for observability. PostgreSQL uses PostgresStoreVNext with separate runtime and observability schemas. Shutdown flushes Mastra before closing owned storage connections. Local data paths must belong to one backend process; keep `.data/` for persistence and exclude it from source control. PostgreSQL behavior requires verification against an actual PostgreSQL deployment.
