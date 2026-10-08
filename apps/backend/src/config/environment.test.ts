import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEnvironment } from "./environment.ts";

test("production cannot fall back to PGlite", () => {
  assert.throws(
    () => parseEnvironment({ NODE_ENV: "production" }),
    /DATABASE_URL is required/,
  );
  assert.throws(() =>
    parseEnvironment({ NODE_ENV: "production", DATABASE_URL: "file:local" }),
  );
  const env = parseEnvironment({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:pass@localhost/tontu",
  });
  assert.ok(env.DATABASE_URL);
});

test("local defaults need no external services", () => {
  const env = parseEnvironment({});
  assert.equal(env.PORT, 4111);
  assert.equal(env.PGLITE_DATA_DIR, "./.data/pglite");
  assert.equal(env.MASTRA_MODEL, undefined);
});
