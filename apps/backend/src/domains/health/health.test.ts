import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseEnvironment } from "../../shared/config/environment.ts";
import { createDatabase } from "../../shared/database/client.ts";
import { createHealthRepository } from "./health.repository.ts";
import { createHealthService } from "./health.service.ts";

test("health service reaches PGlite through its repository", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tontu-health-"));
  const database = createDatabase(
    parseEnvironment({ NODE_ENV: "test", PGLITE_DATA_DIR: directory }),
  );
  try {
    const health = await createHealthService(
      createHealthRepository(database),
    ).getStatus();
    assert.deepEqual(health, { status: "ok", database: "pglite" });
  } finally {
    await database.db.destroy();
    await rm(directory, { recursive: true, force: true });
  }
});
