import { test, expect, describe } from "bun:test";
import { parseSql } from "../src/parse-sql.ts";

describe("CREATE TABLE", () => {
  test("no columns", () => {
    const [_, out] = parseSql("CREATE TABLE users ();");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "users",
        columns: [],
        constraints: [],
        options: [],
        loc: [0, 9],
        optionsLoc: [8,8],
      },
    ]);
  });

  test("if not exists", () => {
    const [_, out] = parseSql("CREATE TABLE IF NOT EXISTS users ();");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "users",
        columns: [],
        constraints: [],
        options: [],
        loc: [0, 15],
        optionsLoc: [14, 14],
      },
    ]);
  });

  test("table with schema", () => {
    const [_, out] = parseSql("create table root. users ();");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "root.users",
        columns: [],
        constraints: [],
        options: [],
        loc: [0, 12],
        optionsLoc: [11, 11],
      },
    ]);
  });

  test("quoted name", () => {
    const [_, out] = parseSql("create table 'root . users' ();");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "root . users",
        columns: [],
        constraints: [],
        options: [],
        loc: [0, 9],
        optionsLoc: [8, 8],
      },
    ]);
  });

  test("table with options", () => {
    const [_, out] = parseSql("CREATE TABLE users () WITHOUT ROWID, strict;");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "users",
        columns: [],
        constraints: [],
        options: [
          {
            type: "table-option",
            text: "WITHOUT ROWID",
            loc: [8, 13],
          },
          {
            type: "table-option",
            text: "STRICT",
            loc: [13, 15],
          },
        ],
        loc: [0, 16],
        optionsLoc: [8, 15],
      },
    ]);
  });

  test("table with columns", () => {
    const [_, out] = parseSql("CREATE TABLE users (id, name , address);");
    expect(out).toEqual([
      {
        type: "create-table-statement",
        name: "users",
        columns: [
          {
            type: "column-def",
            name: "id",
            columnType: null,
            constraints: [],
            loc: [7, 8],
          },
          {
            type: "column-def",
            name: "name",
            columnType: null,
            constraints: [],
            loc: [9, 12],
          },
          {
            type: "column-def",
            name: "address",
            columnType: null,
            constraints: [],
            loc: [13, 15],
          },
        ],
        constraints: [],
        options: [],
        loc: [0, 17],
        optionsLoc: [16, 16],
      },
    ]);
  });
});
