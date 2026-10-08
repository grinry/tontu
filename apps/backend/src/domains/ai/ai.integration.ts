import { Mastra } from "@mastra/core";
import {
  type HonoBindings,
  type HonoVariables,
  MastraServer,
} from "@mastra/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAssistant } from "./agents/assistant.ts";

const LOCAL_STUDIO_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

export async function createAiIntegration(model: `${string}/${string}`) {
  const mastra = new Mastra({ agents: { assistant: createAssistant(model) } });
  const app = new Hono<{ Bindings: HonoBindings; Variables: HonoVariables }>();
  app.use("*", cors({ origin: LOCAL_STUDIO_ORIGINS }));
  const adapter = new MastraServer({ app, mastra });
  try {
    await adapter.init();
    return {
      app,
      start: () => mastra.startWorkers(),
      close: () => mastra.shutdown(),
    };
  } catch (error) {
    await mastra.shutdown();
    throw error;
  }
}
