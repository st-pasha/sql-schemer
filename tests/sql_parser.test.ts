import { describe, test, expect } from "bun:test";
import { tokenize, Token } from "../src/sql_parser";

describe("tokenize", () => {
  describe("Empty", () => {
    test("Empty string", () => {
      const tokens = tokenize("");
      expect(tokens).toEqual([]);
    });

    test("Empty lines", () => {
      const tokens = tokenize("\n  \n \t \r\n ");
      expect(tokens).toEqual([]);
    });

    test("Semicolon only", () => {
      const tokens = tokenize(";");
      expect(tokens).toEqual([{ type: "PUNCT", value: ";" }]);
    });
  });

  describe("Comments", () => {
    test("Simple comment", () => {
      const tokens = tokenize(`    -- This is a comment`);
      expect(tokens).toEqual([
        { type: "COMMENT", value: "-- This is a comment", start: 4 },
      ]);
    });

    test("Multiple line comments", () => {
      const tokens = tokenize(`
        -- Line 1
        -- Line 2

        -- Line 4
      `);
      expect(tokens).toEqual([
        { type: "COMMENT", value: "-- Line 1\n", start: 8 },
        { type: "COMMENT", value: "-- Line 2\n", start: 8 },
        { type: "COMMENT", value: "-- Line 4\n", start: 8 },
      ]);
    });

    test("Multi-line comment", () => {
      const tokens = tokenize(`
        /* Start
           Middle
           End */
      `);
      expect(tokens).toEqual([
        {
          type: "COMMENT",
          value: "/* Start\n           Middle\n           End */",
          start: 8,
        },
      ]);
    });
  });

  describe("Strings", () => {
    test("Single-quoted string", () => {
      const tokens = tokenize(`select 'Hello, world!';`);
      expect(tokens).toEqual([
        { type: "KEYWORD", value: "SELECT" },
        { type: "STRING", value: "'Hello, world!'" },
        { type: "PUNCT", value: ";" },
      ]);
    });

    test("Double-quoted string", () => {
      const tokens = tokenize(`SELECT "Hello, world!" as Hello;`);
      expect(tokens).toEqual([
        { type: "KEYWORD", value: "SELECT" },
        { type: "STRING", value: '"Hello, world!"' },
        { type: "KEYWORD", value: "AS" },
        { type: "WORD", value: "Hello" },
        { type: "PUNCT", value: ";" },
      ]);
    });

    test("String with an embedded quote", () => {
      const tokens = tokenize(`SELECT 'Hello ''world'''`);
      expect(tokens).toEqual([
        { type: "KEYWORD", value: "SELECT" },
        { type: "STRING", value: "'Hello ''world'''" },
      ]);
    });
  });

  describe("Statements", () => {
    test("simple CREATE TABLE statement", () => {
      const tokens = tokenize(`
        CREATE Table Users (
          id INT PRIMARY KEY
        );
      `);
      expect(tokens).toEqual([
        { type: "KEYWORD", value: "CREATE" },
        { type: "KEYWORD", value: "TABLE" },
        { type: "WORD", value: "Users" },
        { type: "PUNCT", value: "(" },
        { type: "WORD", value: "id" },
        { type: "WORD", value: "INT" },
        { type: "KEYWORD", value: "PRIMARY" },
        { type: "KEYWORD", value: "KEY" },
        { type: "PUNCT", value: ")" },
        { type: "PUNCT", value: ";" },
      ]);
    });

    test("CREATE TABLE with multiple columns and comments", () => {
      const tokens = tokenize(`
        CREATE TABLE users (
          /* Internal identifier for the user.
             IDs of deleted users should not be reused. */
          id INT PRIMARY KEY,

          /* Username for login */
          username VARCHAR(255) NOT NULL,
          
          /* Email used for password reminder flow */
          email TEXT NOT NULL
        );
      `);
      expect(tokens).toEqual([
        { type: "KEYWORD", value: "CREATE" },
        { type: "KEYWORD", value: "TABLE" },
        { type: "WORD", value: "users" },
        { type: "PUNCT", value: "(" },
        {
          type: "COMMENT",
          value:
            "/* Internal identifier for the user.\n" +
            "             IDs of deleted users should not be reused. */",
          start: 10,
        },
        { type: "WORD", value: "id" },
        { type: "WORD", value: "INT" },
        { type: "KEYWORD", value: "PRIMARY" },
        { type: "KEYWORD", value: "KEY" },
        { type: "PUNCT", value: "," },
        { type: "COMMENT", value: "/* Username for login */", start: 10 },
        { type: "WORD", value: "username" },
        { type: "WORD", value: "VARCHAR" },
        { type: "PUNCT", value: "(" },
        { type: "WORD", value: "255" },
        { type: "PUNCT", value: ")" },
        { type: "KEYWORD", value: "NOT" },
        { type: "KEYWORD", value: "NULL" },
        { type: "PUNCT", value: "," },
        {
          type: "COMMENT",
          value: "/* Email used for password reminder flow */",
          start: 10,
        },
        { type: "WORD", value: "email" },
        { type: "WORD", value: "TEXT" },
        { type: "KEYWORD", value: "NOT" },
        { type: "KEYWORD", value: "NULL" },
        { type: "PUNCT", value: ")" },
        { type: "PUNCT", value: ";" },
      ]);
    });
  });
});
