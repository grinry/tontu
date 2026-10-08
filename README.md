# Tontu

pnpm workspaces + Turborepo, with an independent Hono API backend and Expo mobile app. Mastra is an optional backend integration.

## Start

Use Node **24.19.0** and pnpm **10.32.1** (pinned):

```sh
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

The API runs at `http://localhost:4111`. Expo prints device/simulator options. The mobile **Check backend** button calls `GET /v1/health` through the backend's route → service → repository layers.

Local development needs no Docker, external database, AI provider, or Mastra runtime. PGlite persists locally in apps/backend/.data/pglite. Production requires PostgreSQL via DATABASE_URL.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start both apps |
| `pnpm dev:backend` / `pnpm dev:mobile` | Start one app |
| `pnpm check` | Biome, TypeScript, and backend tests |
| `pnpm build` | Compile the API and export Android/iOS JS bundles |
| `pnpm db:migrate` | Apply database migrations; stop the local backend first |
| `pnpm lint:fix` / `pnpm format` | Biome fixes / formatting |
| `pnpm --filter @tontu/backend start` | Start the compiled backend |
| `pnpm --filter @tontu/backend studio` | Start the separate Mastra Studio UI after enabling AI |

Optional environment examples live in each app. For a physical phone, set EXPO_PUBLIC_API_URL to your computer's LAN address; the built-in defaults support iOS localhost and the Android emulator's `10.0.2.2`.

Set backend MASTRA_MODEL to `provider/model` plus the provider key to enable AI endpoints under `/ai/api`. With it unset, Mastra is not loaded and the core API still runs. Persistent Mastra conversation/workflow storage is not configured yet.

## Documentation

Read [docs/README.md](./docs/README.md) before changing the project. Documentation is organized by owner:

- [Repository structure](./docs/structure.md), [infrastructure](./docs/infrastructure.md), and [coding rules](./docs/coding-rules.md).
- [Backend docs](./apps/backend/docs/README.md): independent server, AI integration, services/repositories, database, and transactions.
- [Mobile docs](./apps/mobile/docs/README.md): domains, API configuration, Expo, and native builds.

Each app has AGENTS.md and a CLAUDE.md that references it. Read the relevant documents before work and update them with changes. Future apps/packages must include the same documentation/instruction structure.
