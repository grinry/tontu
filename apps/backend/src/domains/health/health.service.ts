import { HEALTH_STATUS } from "./health.constants.ts";
import type { HealthRepository } from "./health.repository.ts";

export function createHealthService(repository: HealthRepository) {
  return {
    async getStatus() {
      try {
        await repository.ping();
        return { status: HEALTH_STATUS.ok, database: repository.kind };
      } catch {
        return { status: HEALTH_STATUS.unavailable };
      }
    },
  };
}

export type HealthService = ReturnType<typeof createHealthService>;
