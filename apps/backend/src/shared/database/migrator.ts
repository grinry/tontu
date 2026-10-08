import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Kysely } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import type { Database } from "./schema.ts";

export function createMigrator(db: Kysely<Database>) {
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(
        process.cwd(),
        "src/shared/database/migrations",
      ),
    }),
  });
}
