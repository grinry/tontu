import { sql } from "kysely";
import type { createDatabase } from "../../shared/database/client.ts";

export function createHealthRepository(
  database: ReturnType<typeof createDatabase>,
) {
  return {
    kind: database.kind,
    async ping() {
      await sql`select 1`.execute(database.db);
    },
  };
}

export type HealthRepository = ReturnType<typeof createHealthRepository>;
