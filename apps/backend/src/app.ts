import { Hono } from "hono";
import {
  createHealthRoutes,
  type HealthService,
} from "./domains/health/index.ts";
import { HTTP_STATUS } from "./shared/http/status.ts";

export function createApp(healthService: HealthService) {
  const app = new Hono();
  app.onError((error, context) => {
    console.error("Unhandled API error", error);
    return context.json(
      { error: "Internal server error" },
      HTTP_STATUS.internalServerError,
    );
  });
  app.route("/v1", createHealthRoutes(healthService));
  return app;
}
