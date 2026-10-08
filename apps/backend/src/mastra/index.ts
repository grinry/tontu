import { Mastra } from "@mastra/core";
import { createHealthRoute } from "../api/health.ts";
import { loadEnvironment } from "../config/environment.ts";
import { createDatabase } from "../database/client.ts";
import { createAssistant } from "./agents/assistant.ts";

const environment = loadEnvironment();
const database = createDatabase(environment);
const assistant = environment.MASTRA_MODEL
  ? createAssistant(environment.MASTRA_MODEL as `${string}/${string}`)
  : undefined;

export const mastra = new Mastra({
  agents: assistant ? { assistant } : undefined,
  server: {
    host: environment.HOST,
    port: environment.PORT,
    apiRoutes: [createHealthRoute(database)],
  },
});

// Mastra drains HTTP requests before shutdown; then close our application database.
const shutdownMastra = mastra.shutdown.bind(mastra);
mastra.shutdown = async (options) => {
  try {
    await shutdownMastra(options);
  } finally {
    await database.db.destroy();
  }
};
