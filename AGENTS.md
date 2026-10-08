# Tontu working instructions

- Use pnpm 10.32.1 and Node 24.19.0. Keep dependency versions exact and use the root lockfile.
- Ask before adding production dependencies or committing. Do not mix package managers.
- Read app-level instructions before changing that app.
- Run `pnpm check` and builds relevant to the change before completion.
- Use Biome for linting and formatting. Prefer const patterns over TypeScript enums.
- Keep database/server credentials in the backend. Expo public environment variables are shipped to clients.
- Keep code split by domain; reuse existing helpers and avoid speculative shared packages.
- Local database: persistent PGlite. Production: PostgreSQL through `DATABASE_URL`, with Kysely for both.
- Update table types and explicit migrations together. Stop the local server before migrating its PGlite data directory.
- An investigation request authorizes diagnosis, not implementing a fix; ask before fixing.
