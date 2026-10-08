# Workspace infrastructure

## Toolchain and task orchestration

Use Node 24.19.0 (`.nvmrc`, `.node-version`) and pnpm 10.32.1 (`packageManager`). Dependencies are exact and managed by one root pnpm-lock.yaml. Use `pnpm install --frozen-lockfile` for reproducible installs. Obtain approval for new production dependencies and keep the package manager consistent.

pnpm workspaces discover `apps/*`. When a real shared package is introduced, add `packages/*` to pnpm-workspace.yaml and document its ownership. Turborepo runs development, builds, type checks, and tests. Development tasks are uncached/persistent; build artifacts live in each app's `dist/`. Environment variables consumed by tasks must be declared in turbo.json; public mobile configuration participates in build hashing.

Biome is the repository formatter/linter. `pnpm check` runs Biome, both apps' TypeScript checks, and backend tests. `pnpm build` compiles the backend and exports Expo's Android/iOS JavaScript bundles. Native signed artifacts require the mobile build workflow described in its docs.

## Runtime and deployment boundaries

The backend owns a Hono HTTP server on port 4111 by default. Its application API operates without loading Mastra; configuring a model enables the separately mounted AI integration. Studio is a separate development UI, not the backend server.

Mobile runs through Expo and calls the backend's application API. Each app has its own environment/build configuration and deployment lifecycle. Keep backend provider/database credentials out of mobile and public variables.

Local development uses persistent PGlite without Docker. Production backend deployments require PostgreSQL via DATABASE_URL. The local PGlite directory belongs to one process; stop that process before running migrations. See [backend infrastructure](../apps/backend/docs/infrastructure.md) and [database operations](../apps/backend/docs/database.md).

No cloud backend/database provider, CI workflow, production domain, or EAS project has been configured yet. Document those choices here and in the owning app when introduced.

## Change maintenance

Update this document when tool versions, tasks, workspace discovery, caching inputs/outputs, or deployment boundaries change. Update app docs for app-specific commands, environment variables, and infrastructure. Keep README quick-start commands consistent with the actual scripts.
