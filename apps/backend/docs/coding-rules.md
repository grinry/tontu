# Backend coding rules

The repository [coding rules](../../../docs/coding-rules.md) apply. This document owns backend-specific layer responsibilities.

## Routes → services → repositories

- **Routes** handle HTTP input/output, request validation, authentication context, and status codes. They call services and do not construct database queries.
- **Services** implement use cases, business invariants, error semantics, and transaction boundaries. They call repositories, without depending on HTTP request/response types.
- **Repositories** contain SQL/Kysely queries and persistence mapping. They do not depend on HTTP objects, AI models, or service implementations.
- **Composition** creates infrastructure dependencies and injects them into repositories/services/routes. It may import multiple domain public indexes; domains may not import each other.

Keep domain-owned repository/service interfaces close to that domain. Shared database/configuration code is infrastructure and must not import domain code. Mastra's vendor endpoints are integration infrastructure; product APIs still follow the application layers.

For a use case needing multiple repositories, inject their contracts through the composition root. If multiple domains need the implementation/contract, move the reused responsibility to `shared/`; do not import a sibling domain or introduce a shared re-export of its internals.

Use dependency injection with ordinary functions rather than building a container or a generic repository hierarchy. Read-only health checks still demonstrate the route/service/repository flow. Migrations and database tests may run direct queries as explicit infrastructure/test exceptions.

## Writes and transactions

Follow the transaction rules in [database.md](./database.md). Group related writes and invariant-sensitive reads/writes into one transaction, pass its executor into every participating repository, and let errors cause rollback. Test failure paths and concurrency-sensitive invariants, not just successful writes.

Never swallow an error inside a transaction and continue as if the whole operation succeeded. Keep external network/AI calls outside a transaction. Database constraints provide the final guard for data integrity; service checks alone are insufficient under concurrency.
