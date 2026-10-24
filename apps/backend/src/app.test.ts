import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "./app.ts";
import { createHealthService } from "./domains/health/index.ts";
import { DATABASE_KIND } from "./shared/config/constants.ts";
import { HTTP_STATUS } from "./shared/http/status.ts";

test("Studio detects an enabled AI server through a CORS-enabled root response", async () => {
  const service = createHealthService({
    kind: DATABASE_KIND.pglite,
    ping: async () => {},
  });
  const app = createApp(service, { studioEnabled: true });
  const response = await app.request("/", {
    headers: { Origin: "http://localhost:3000" },
  });
  assert.equal(response.status, HTTP_STATUS.ok);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://localhost:3000",
  );
  const untrusted = await app.request("/", {
    headers: { Origin: "https://example.com" },
  });
  assert.equal(untrusted.headers.get("access-control-allow-origin"), null);
  assert.equal(
    (await createApp(service).request("/")).status,
    HTTP_STATUS.notFound,
  );
});

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
