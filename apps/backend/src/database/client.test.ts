import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { sql } from "kysely";
import { Migrator } from "kysely/migration";
import { DATABASE_KIND, parseEnvironment } from "../config/environment.ts";
import { createDatabase } from "./client.ts";

test("PGlite persists data, rolls back transactions, and reuses migration history", async () => {
  const directory = await mkdtemp(join(tmpdir(), "tontu-db-"));
  const environment = parseEnvironment({
    NODE_ENV: "test",
    PGLITE_DATA_DIR: join(directory, "nested", "pglite"),
  });
  let database = createDatabase(environment);
  const provider = {
    getMigrations: async () => ({
      "001_test": {
        up: async (db: typeof database.db) => {
          await sql`create table starter_probe (value text not null)`.execute(
            db,
          );
        },
      },
    }),
  };
  try {
    assert.equal(database.kind, DATABASE_KIND.pglite);
    const first = await new Migrator({
      db: database.db,
      provider,
    }).migrateToLatest();
    assert.ifError(first.error);
    assert.equal(first.results?.length, 1);
    await sql`insert into starter_probe (value) values (${"persisted"})`.execute(
      database.db,
    );
    await assert.rejects(
      database.db.transaction().execute(async (transaction) => {
        await sql`insert into starter_probe (value) values (${"rolled back"})`.execute(
          transaction,
        );
        throw new Error("rollback probe");
      }),
      /rollback probe/,
    );
    await database.db.destroy();
    database = createDatabase(environment);
    const second = await new Migrator({
      db: database.db,
      provider,
    }).migrateToLatest();
    assert.ifError(second.error);
    assert.equal(second.results?.length, 0);
    const result = await sql<{
      value: string;
    }>`select value from starter_probe`.execute(database.db);
    assert.deepEqual(result.rows, [{ value: "persisted" }]);
  } finally {
    await database.db.destroy();
    await rm(directory, { recursive: true, force: true });
  }
});

test("DATABASE_URL selects the PostgreSQL driver", async () => {
  const database = createDatabase(
    parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost/tontu",
    }),
  );
  assert.equal(database.kind, DATABASE_KIND.postgres);
  await database.db.destroy();
});
