// import { test, expect, describe, beforeAll, afterAll } from "bun:test";
// import { SqliteSchemaReader } from "../src/read-schema-from-sqlite.ts";

// class TestSqliteReader extends SqliteSchemaReader {
//   public loadSchema() {
//     return super.loadSchema();
//   }
// }

// describe("SqliteReader", () => {
//   let sqliteReader: TestSqliteReader;

//   beforeAll(() => {
//     sqliteReader = new TestSqliteReader(":memory:");
//     sqliteReader.db.run(`
//         CREATE TABLE users (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );

//         CREATE INDEX idx_users_name ON users(name);

//         CREATE VIEW user_names AS
//         SELECT name FROM users;

//         -- this comment will disappear
//         create trigger user_name_trigger
//         AFTER INSERT ON users
//         BEGIN
//             -- normalize name to uppercase
//             UPDATE users SET name = upper(new.name) WHERE id = new.id;
//         END;
//     `);
//   });

//   afterAll(() => {
//     sqliteReader.dispose();
//   });

//   test("loadSchema returns correct schema information", () => {
//     const schema = sqliteReader.loadSchema();
//     expect(schema).toEqual([
//       {
//         type: "table",
//         name: "users",
//         tbl_name: "users",
//         sql:
//           "CREATE TABLE users (\n" +
//           "            id INTEGER PRIMARY KEY,\n" +
//           "            name TEXT NOT NULL\n" +
//           "        )",
//       },
//       {
//         type: "index",
//         name: "idx_users_name",
//         tbl_name: "users",
//         sql: "CREATE INDEX idx_users_name ON users(name)",
//       },
//       {
//         type: "view",
//         name: "user_names",
//         tbl_name: "user_names",
//         sql:
//           "CREATE VIEW user_names AS\n" + //
//           "        SELECT name FROM users",
//       },
//       {
//         type: "trigger",
//         name: "user_name_trigger",
//         tbl_name: "users",
//         sql:
//           "CREATE TRIGGER user_name_trigger\n" +
//           "        AFTER INSERT ON users\n" +
//           "        BEGIN\n" +
//           "            -- normalize name to uppercase\n" +
//           "            UPDATE users SET name = upper(new.name) WHERE id = new.id;\n" +
//           "        END",
//       },
//     ]);
//   });
// });
