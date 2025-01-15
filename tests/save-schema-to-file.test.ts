import fs from "fs";
import path from "path";
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { saveSchemaToFile } from "../src/index.ts";
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
        )
    `);
    createTestFile(`
        -- this is a comment
        CREATE TABLE users (
            id     INTEGER PRIMARY KEY,
            name   TEXT not null
        );
    `);
    const result = saveSchemaToFile(testDbPath, testSqlFilePath);
    expect(result).toBe(false);
  });

  test("should return true and update the file if there are schema differences", () => {
    createTestDb(`
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL
      );
    `);
    createTestFile(`
      -- all important posts are stored here
      create table posts(id integer, title text);
    `);

    debugger;
    const result = saveSchemaToFile(testDbPath, testSqlFilePath);
    expect(result).toBe(true);

    const updatedSchema = fs.readFileSync(testSqlFilePath, "utf-8");
    expect(updatedSchema).toBe(
      "CREATE TABLE posts (\n" +
      "        id INTEGER PRIMARY KEY,\n" +
      "        title TEXT NOT NULL\n" +
      "      );\n    "
    );
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
