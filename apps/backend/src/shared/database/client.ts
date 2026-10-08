import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { Kysely, PGliteDialect, PostgresDialect } from "kysely";
import pg from "pg";
import { DATABASE_KIND } from "../config/constants.ts";
import type { Environment } from "../config/environment.ts";
import type { Database } from "./schema.ts";

export function createDatabase(environment: Environment) {
  if (environment.NODE_ENV === "production" && !environment.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required in production; PGlite is local-only.",
    );
  }
  const kind = environment.DATABASE_URL
    ? DATABASE_KIND.postgres
    : DATABASE_KIND.pglite;
  const dialect = environment.DATABASE_URL
    ? new PostgresDialect({
        pool: new pg.Pool({
          connectionString: environment.DATABASE_URL,
          max: 10,
          connectionTimeoutMillis: 10_000,
        }),
      })
    : new PGliteDialect({
        pglite: async () => {
          const dataDirectory = resolve(environment.PGLITE_DATA_DIR);
          await mkdir(dataDirectory, { recursive: true });
          return new PGlite(dataDirectory);
        },
      });
  return { kind, db: new Kysely<Database>({ dialect }) };
}
