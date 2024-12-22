import { describe, test, expect } from "bun:test";
import { tokenize } from "../src/tokenize.ts";

describe("tokenize", () => {
  describe("Empty", () => {
    test("Empty string", () => {
      const tokens = tokenize("");
      expect(tokens).toEqual([]);
    });

    test("Empty lines", () => {
      const tokens = tokenize("\n  \n \t \r\n ");
      expect(tokens).toEqual([
        { type: "WHITESPACE", value: "\n  \n \t \r\n " },
      ]);
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
        { type: "WHITESPACE", value: "    " },
        { type: "COMMENT", value: "-- This is a comment" },
      ]);
    });

    test("Multiple line comments", () => {
      const tokens = tokenize(`
        -- Line 1
        -- Line 2

        -- Line 4
      `);
      expect(tokens).toEqual([
        { type: "WHITESPACE", value: "\n        " },
        { type: "COMMENT", value: "-- Line 1\n" },
        { type: "WHITESPACE", value: "        " },
        { type: "COMMENT", value: "-- Line 2\n" },
        { type: "WHITESPACE", value: "\n        " },
        { type: "COMMENT", value: "-- Line 4\n" },
        { type: "WHITESPACE", value: "      " },
      ]);
    });

    test("Multi-line comment", () => {
      const tokens = tokenize(`
        /* Start
           Middle
           End */
      `);
      expect(tokens).toEqual([
        { type: "WHITESPACE", value: "\n        " },
        {
          type: "COMMENT",
          value: "/* Start\n           Middle\n           End */",
        },
        { type: "WHITESPACE", value: "\n      " },
      ]);
    });
  });

  describe("Strings", () => {
    test("Single-quoted string", () => {
      const tokens = tokenize(`select 'Hello, world!';`);
      expect(tokens).toEqual([
        { type: "WORD", value: "select" },
        { type: "WHITESPACE", value: " " },
        { type: "STRING", value: "'Hello, world!'" },
        { type: "PUNCT", value: ";" },
      ]);
    });

    test("Double-quoted string", () => {
      const tokens = tokenize(`SELECT "Hello, world!" as Hello;`);
      expect(tokens).toEqual([
        { type: "WORD", value: "SELECT" },
        { type: "WHITESPACE", value: " " },
        { type: "STRING", value: '"Hello, world!"' },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "as" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "Hello" },
        { type: "PUNCT", value: ";" },
      ]);
    });

    test("String with an embedded quote", () => {
      const tokens = tokenize(`SELECT 'Hello ''world'''`);
      expect(tokens).toEqual([
        { type: "WORD", value: "SELECT" },
        { type: "WHITESPACE", value: " " },
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
        { type: "WHITESPACE", value: "\n        " },
        { type: "WORD", value: "CREATE" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "Table" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "Users" },
        { type: "WHITESPACE", value: " " },
        { type: "PUNCT", value: "(" },
        { type: "WHITESPACE", value: "\n          " },
        { type: "WORD", value: "id" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "INT" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "PRIMARY" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "KEY" },
        { type: "WHITESPACE", value: "\n        " },
        { type: "PUNCT", value: ")" },
        { type: "PUNCT", value: ";" },
        { type: "WHITESPACE", value: "\n      " },
      ]);
    });

    test("CREATE TABLE with multiple columns and comments", () => {
      const text = `
        CREATE TABLE users (
          /* Internal identifier for the user.
             IDs of deleted users should not be reused. */
          id INT PRIMARY KEY,

          /* Username for login */
          username VARCHAR(255) NOT NULL,
          
          /* Email used for password reminder flow */
          email TEXT NOT NULL
        );
      `;
      const tokens = tokenize(text);

      expect(tokens).toEqual([
        { type: "WHITESPACE", value: "\n        " },
        { type: "WORD", value: "CREATE" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "TABLE" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "users" },
        { type: "WHITESPACE", value: " " },
        { type: "PUNCT", value: "(" },
        { type: "WHITESPACE", value: "\n          " },
        {
          type: "COMMENT",
          value:
            "/* Internal identifier for the user.\n" +
            "             IDs of deleted users should not be reused. */",
        },
        { type: "WHITESPACE", value: "\n          " },
        { type: "WORD", value: "id" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "INT" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "PRIMARY" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "KEY" },
        { type: "PUNCT", value: "," },
        { type: "WHITESPACE", value: "\n\n          " },
        { type: "COMMENT", value: "/* Username for login */" },
        { type: "WHITESPACE", value: "\n          " },
        { type: "WORD", value: "username" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "VARCHAR" },
        { type: "PUNCT", value: "(" },
        { type: "WORD", value: "255" },
        { type: "PUNCT", value: ")" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "NOT" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "NULL" },
        { type: "PUNCT", value: "," },
        { type: "WHITESPACE", value: "\n          \n          " },
        {
          type: "COMMENT",
          value: "/* Email used for password reminder flow */",
        },
        { type: "WHITESPACE", value: "\n          " },
        { type: "WORD", value: "email" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "TEXT" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "NOT" },
        { type: "WHITESPACE", value: " " },
        { type: "WORD", value: "NULL" },
        { type: "WHITESPACE", value: "\n        " },
        { type: "PUNCT", value: ")" },
        { type: "PUNCT", value: ";" },
        { type: "WHITESPACE", value: "\n      " },
      ]);
      const reconstructed = tokens.map((tok) => tok.value).join('');
      expect(reconstructed).toEqual(text);
    });
  });
});
