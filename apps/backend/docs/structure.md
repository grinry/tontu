# Backend structure

```text
src/
  server.ts                    # Creates dependencies, owns listening/startup/shutdown
  app.ts                       # Composes application routes; no Mastra runtime import
  app.test.ts                  # Core API availability and error contract
  domains/
    health/
      index.ts                 # Public composition exports
      health.routes.ts         # HTTP mapping at /v1/health
      health.service.ts        # Availability use case
      health.repository.ts     # Kysely database probe
      health.constants.ts
      health.test.ts
    ai/
      index.ts
      ai.integration.ts        # Mastra runtime + Hono adapter on a child app
      agents/assistant.ts
  shared/
    config/                    # Environment loading/validation and database-kind constants
    database/                  # Kysely drivers, schema types, migration CLI and tests
      migrations/
    http/                      # HTTP status constants and graceful-close helper
```

`server.ts` creates database infrastructure, injects it into the health repository/service, and passes the service to `createApp`. The route receives the service, not the database. SQL for the health check lives in its repository.

With MASTRA_MODEL unset, the runtime does not import or initialize the AI domain. When configured, server.ts dynamically creates the AI integration and mounts its child Hono app at `/ai`. Adapter middleware is restricted to that mount, so the application API is not coupled to Mastra context/authentication/lifecycle.

Domains do not import each other. Composition may import their `index.ts` files; shared modules must not import domains. Keep helpers/types/constants local to their domain unless reuse requires an app-local shared feature. No product domain or business table has been invented beyond the starter health feature.

When adding or moving modules, update this tree, [coding rules](./coding-rules.md), and relevant documentation links.
