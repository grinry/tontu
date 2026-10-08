import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "./app.ts";
import { createHealthService } from "./domains/health/index.ts";
import { DATABASE_KIND } from "./shared/config/constants.ts";
import { HTTP_STATUS } from "./shared/http/status.ts";

test("application API serves health and does not mount AI by default", async () => {
  const app = createApp(
    createHealthService({ kind: DATABASE_KIND.pglite, ping: async () => {} }),
  );
  const response = await app.request("/v1/health");
  assert.equal(response.status, HTTP_STATUS.ok);
  assert.deepEqual(await response.json(), {
    status: "ok",
    database: DATABASE_KIND.pglite,
  });
  assert.equal(
    (await app.request("/ai/api/agents")).status,
    HTTP_STATUS.notFound,
  );
});

test("database failure produces a safe 503 without exposing details", async () => {
  const app = createApp(
    createHealthService({
      kind: DATABASE_KIND.postgres,
      ping: async () => {
        throw new Error("private database details");
      },
    }),
  );
  const response = await app.request("/v1/health");
  assert.equal(response.status, HTTP_STATUS.serviceUnavailable);
  assert.deepEqual(await response.json(), { status: "unavailable" });
});
