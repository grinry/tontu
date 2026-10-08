# API server decision

Decision: **Hono owns the application's HTTP server; Mastra is an optional integration.**

The original starter used Mastra's generated server for the entire API. Application endpoints must also work without Mastra, so the app now uses its own server entry point and its own TypeScript build. Product routes use application services/repositories, and the AI domain uses Mastra's official Hono adapter on a separate child app.

## Options considered

| Framework | Relevant strength | Fit here |
| --- | --- | --- |
| Hono | Small Web-standard API, straightforward composition, native Mastra middleware compatibility | Chosen for this TypeScript starter and optional AI integration |
| Fastify | Schema-driven validation/serialization and plugin-oriented server structure | Strong alternative when those API conventions are desired |
| Express | Familiar routing/middleware ecosystem | Reasonable if the team prefers existing Express tools/conventions |

All three currently have official Mastra adapters. Hono was chosen for its fit and simplicity, not because the others cannot run Mastra. No performance benchmark was used to justify this choice.

## Independent API and optional AI

- The app owns its Node HTTP server, startup, and graceful shutdown.
- Core product routes use `/v1`; the existing mobile health contract stays `GET /v1/health`.
- Configuring MASTRA_MODEL explicitly enables the AI child app at `/ai`; adapter endpoints such as agents are under `/ai/api/agents`.
- With no model configured, the AI module is not loaded and `/ai/*` has no registered routes.
- Product domains must not depend on vendor HTTP request context. If a future use case needs AI, define the reused contract in shared code and inject an implementation through composition.
- Explicitly configured integration startup errors fail startup; disabled AI does not affect core API availability. Runtime health checks query the application database, not an AI provider.

Persistent Mastra conversation/workflow storage is not configured. Application database persistence through Kysely is separate from Mastra's own storage system.

## References

Decision checked on 2026-10-08 against [Mastra server adapters](https://mastra.ai/docs/server/server-adapters), [Hono on Node.js](https://hono.dev/docs/getting-started/nodejs), [Fastify validation/serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/), and [Express routing](https://expressjs.com/en/starter/basic-routing/). Revisit this decision if application requirements create a concrete need for another framework.
