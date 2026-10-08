# Mobile structure

```text
App.tsx                         # Root screen composition
index.ts                        # Expo entry registration
src/
  domains/
    health/
      index.ts                  # Public screen export
      HealthScreen.tsx          # Connection-check screen/state/styles
      health.api.ts             # Feature-owned request and response validation
  shared/
    config/api.ts               # Public API URL and emulator defaults
```

The current single-screen app has no navigation library. App.tsx composes the health domain's public screen. If navigation is introduced later, Expo Router route files live in `src/app/` and compose domain screens; feature implementations stay inside their domains.

A domain must not import another domain. Reused client features/configuration belong in `src/shared/`. Shared modules must not import domain implementations. Keep domain requests and state colocated with the feature, not in global folders that mix unrelated features.

Mobile must not import backend source, database clients, AI provider credentials, or server-only workspace packages. Introduce a client-safe workspace contract package only when there is actual cross-app reuse. Update this document as screens, domains, or navigation change.
