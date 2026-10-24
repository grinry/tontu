import { Mastra } from "@mastra/core";
import { MastraEditor } from "@mastra/editor";
import {
  type HonoBindings,
  type HonoVariables,
  MastraServer,
} from "@mastra/hono";
import { MastraStorageExporter, Observability } from "@mastra/observability";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Environment } from "../../shared/config/environment.ts";
import { LOCAL_STUDIO_ORIGINS } from "../../shared/http/studio.ts";
import { createAssistant } from "./agents/assistant.ts";
import { createAiStorage } from "./ai.storage.ts";

export async function createAiIntegration(environment: Environment) {
  const persistence = await createAiStorage(environment);
  const mastra = new Mastra({
    agents: {
      assistant: createAssistant(
        environment.MASTRA_MODEL as `${string}/${string}`,
      ),
    },
    storage: persistence.storage,
    editor: new MastraEditor(),
    observability: new Observability({
      configs: {
        default: {
          serviceName: "tontu-backend",
          exporters: [new MastraStorageExporter()],
        },
      },
    }),
  });
  const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();
  app.use("*", cors({ origin: LOCAL_STUDIO_ORIGINS, credentials: true }));
  const adapter = new MastraServer({ app, mastra });
  const close = async () => {
    try {
      await mastra.shutdown();
    } finally {
      await persistence.close();
    }
  };
  try {
    await adapter.init();
    return {
      app,
      start: () => mastra.startWorkers(),
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
