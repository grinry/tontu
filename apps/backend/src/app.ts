import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createHealthRoutes,
  type HealthService,
} from "./domains/health/index.ts";
import { HTTP_STATUS } from "./shared/http/status.ts";
import { LOCAL_STUDIO_ORIGINS } from "./shared/http/studio.ts";

export function createApp(
  healthService: HealthService,
  options: { studioEnabled?: boolean } = {},
) {
  const app = new Hono();
  if (options.studioEnabled) {
    // Studio probes the instance root before using its configured API prefix.
    app.use("/", cors({ origin: LOCAL_STUDIO_ORIGINS }));
    app.get("/", (context) => context.json({ status: "ok" }));
  }
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
