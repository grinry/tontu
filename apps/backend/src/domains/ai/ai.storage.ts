import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { MastraCompositeStore } from "@mastra/core/storage";
import { DuckDBStore } from "@mastra/duckdb";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStoreVNext } from "@mastra/pg";
import type { Environment } from "../../shared/config/environment.ts";

export async function createAiStorage(environment: Environment) {
  if (environment.DATABASE_URL) {
    const storage = new PostgresStoreVNext({
      id: "tontu-mastra",
      connectionString: environment.DATABASE_URL,
      schemaName: "mastra",
      observability: {
        connectionString: environment.DATABASE_URL,
        schemaName: "mastra_observability",
      },
    });
    return { storage, close: () => storage.close() };
  }
  const path = resolve(environment.MASTRA_STORAGE_PATH);
  await mkdir(dirname(path), { recursive: true });
  const runtime = new LibSQLStore({
    id: "tontu-mastra",
    url: pathToFileURL(path).href,
  });
  const telemetry = new DuckDBStore({ path: `${path}.observability.duckdb` });
  try {
    const storage = new MastraCompositeStore({
      id: "tontu-mastra-composite",
      default: runtime,
      domains: { observability: await telemetry.getStore("observability") },
    });
    return {
      storage,
      close: async () => {
        try {
          await telemetry.close();
        } finally {
          await runtime.close();
        }
      },
    };
  } catch (error) {
    await telemetry.close();
    await runtime.close();
    throw error;
  }
}
