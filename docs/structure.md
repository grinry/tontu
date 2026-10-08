# Workspace structure and ownership

```text
tontu/
  AGENTS.md / CLAUDE.md      # Shared working instructions and Claude entry point
  docs/                     # Repository-wide structure/infrastructure/rules
  apps/
    backend/
      AGENTS.md / CLAUDE.md
      docs/                 # Backend-owned documentation
      src/
        server.ts           # Runtime composition and HTTP lifecycle
        app.ts              # Application HTTP composition
        domains/
          health/           # Health routes, service, repository, and tests
          ai/               # Optional Mastra integration and agents
        shared/             # Config, database infrastructure, HTTP helpers
    mobile/
      AGENTS.md / CLAUDE.md
      docs/                 # Mobile-owned documentation
      App.tsx               # Screen composition
      src/
        domains/health/     # Health screen and feature-owned API client
        shared/config/      # Public API configuration
```

Only backend and mobile currently exist. Add landing/web apps when needed, with their own instructions and docs. Add `packages/<name>` only for actual cross-app reuse; each package needs AGENTS.md, a referencing CLAUDE.md, and a docs index with structure/infrastructure/coding documents.

Domains own features and expose deliberately chosen entry points through `index.ts`. Composition files outside domains may wire their public APIs together. A domain cannot import another domain, even its public API; extract reusable implementations/contracts to `shared/` instead. Shared modules must not import domains.

App-local shared code stays within its app. Workspace packages must not import app source, and mobile must not import backend source. See [coding rules](./coding-rules.md) and the app documentation for local layer responsibilities.
