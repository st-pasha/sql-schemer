import fs from "fs";
import path from "path";
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { saveSchemaToFile } from "../src/save-schema-to-file.ts";
import { sqliteAdapter } from "../src/sqlite-adapter.ts";

const testDbPath = path.join(__dirname, "test-db.sqlite");
const testSqlFilePath = path.join(__dirname, "test-schema.sql");

describe("saveSchemaToFile", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("should return false if there are no schema differences", () => {
    createTestDb(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );
    `);
    createTestFile(`
        -- this is a comment
        CREATE TABLE users (
            id     INTEGER PRIMARY KEY,
            name   TEXT NOT NULL
        );
    `);
    debugger;
    const result = saveSchemaToFile(testDbPath, testSqlFilePath);
    expect(result).toBe(false);
  });

  test.skip("should return true and update the file if there are schema differences", () => {
    const dbAdapter = sqliteAdapter(testDbPath);
    dbAdapter.run(`
            CREATE TABLE posts (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL
            );
        `);
    dbAdapter.close();

    const result = saveSchemaToFile(testDbPath, testSqlFilePath);
    expect(result).toBe(true);

    const updatedSchema = fs.readFileSync(testSqlFilePath, "utf-8");
    expect(updatedSchema).toContain("CREATE TABLE posts");
  });
});

function createTestDb(sql: string) {
  const db = sqliteAdapter(testDbPath);
  db.run(sql);
  db.close();
}

function createTestFile(sql: string) {
  fs.writeFileSync(testSqlFilePath, sql);
}

function cleanup() {
  try {
    fs.unlinkSync(testDbPath);
  } catch (e) {}
  try {
    fs.unlinkSync(testSqlFilePath);
  } catch (e) {}
}
