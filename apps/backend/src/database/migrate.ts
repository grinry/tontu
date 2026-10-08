import { loadEnvironment } from "../config/environment.ts";
import { createDatabase } from "./client.ts";
import { createMigrator } from "./migrator.ts";

const { db, kind } = createDatabase(loadEnvironment());
try {
  const { error, results } = await createMigrator(db).migrateToLatest();
  if (error) throw error;
  for (const result of results ?? [])
    console.info(`${result.migrationName}: ${result.status}`);
  console.info(`Migrations complete (${kind}).`);
} finally {
  await db.destroy();
}
