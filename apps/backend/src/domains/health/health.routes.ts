import { Hono } from "hono";
import { HTTP_STATUS } from "../../shared/http/status.ts";
import { HEALTH_STATUS } from "./health.constants.ts";
import type { HealthService } from "./health.service.ts";

export function createHealthRoutes(service: HealthService) {
  return new Hono().get("/health", async (context) => {
    const result = await service.getStatus();
    return context.json(
      result,
      result.status === HEALTH_STATUS.ok
        ? HTTP_STATUS.ok
        : HTTP_STATUS.serviceUnavailable,
    );
  });
}
