import { type ServerType, serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import type { createAiIntegration } from "./domains/ai/index.ts";
import {
  createHealthRepository,
  createHealthService,
} from "./domains/health/index.ts";
import { loadEnvironment } from "./shared/config/environment.ts";
import { createDatabase } from "./shared/database/client.ts";
import { closeHttpServer } from "./shared/http/lifecycle.ts";

const environment = loadEnvironment();
const database = createDatabase(environment);
const app = createApp(createHealthService(createHealthRepository(database)));
let ai: Awaited<ReturnType<typeof createAiIntegration>> | undefined;
let server: ServerType | undefined;

async function closeResources() {
  try {
    await ai?.close();
  } finally {
    await database.db.destroy();
  }
}

try {
  if (environment.MASTRA_MODEL) {
    const { createAiIntegration } = await import("./domains/ai/index.ts");
    ai = await createAiIntegration(
      environment.MASTRA_MODEL as `${string}/${string}`,
    );
    app.route("/ai", ai.app);
  }
} catch (error) {
  await closeResources();
  throw error;
}

try {
  server = serve({
    fetch: app.fetch,
    port: environment.PORT,
    hostname: environment.HOST,
  });
  await new Promise<void>((resolve, reject) => {
    server?.once("listening", resolve);
    server?.once("error", reject);
  });
  await ai?.start();
  console.info(
    `Tontu API listening on ${environment.HOST}:${environment.PORT}`,
  );
} catch (error) {
  try {
    if (server?.listening) await closeHttpServer(server);
  } finally {
    await closeResources();
  }
  throw error;
}

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    try {
      if (server?.listening) await closeHttpServer(server);
    } finally {
      await closeResources();
    }
  } catch (error) {
    console.error("Shutdown failed", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
