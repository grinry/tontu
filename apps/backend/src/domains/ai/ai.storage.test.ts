import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseEnvironment } from "../../shared/config/environment.ts";
import { createAiStorage } from "./ai.storage.ts";

test("AI threads survive storage restart and editor and observability stores exist", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tontu-ai-"));
  const environment = parseEnvironment({
    MASTRA_STORAGE_PATH: join(directory, "mastra.db"),
  });
  let persistence = await createAiStorage(environment);
  try {
    await persistence.storage.init();
    const memory = await persistence.storage.getStore("memory");
    assert.ok(memory);
    await memory.saveThread({
      thread: {
        id: "test-thread",
        resourceId: "test-user",
        title: "Remember me",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    assert.ok(await persistence.storage.getStore("agents"));
    assert.ok(await persistence.storage.getStore("observability"));
    await persistence.close();
    persistence = await createAiStorage(environment);
    await persistence.storage.init();
    const reopened = await persistence.storage.getStore("memory");
    assert.equal(
      (await reopened?.getThreadById({ threadId: "test-thread" }))?.title,
      "Remember me",
    );
  } finally {
    await persistence.close();
    await rm(directory, { recursive: true, force: true });
  }
});
