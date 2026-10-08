import { registerApiRoute } from "@mastra/core/server";
import { sql } from "kysely";
import type { createDatabase } from "../database/client.ts";

export function createHealthRoute(database: ReturnType<typeof createDatabase>) {
  return registerApiRoute("/v1/health", {
    method: "GET",
    handler: async (context) => {
      try {
        await sql`select 1`.execute(database.db);
        return context.json({ status: "ok", database: database.kind });
      } catch {
        return context.json({ status: "unavailable" }, 503);
      }
    },
  });
}
