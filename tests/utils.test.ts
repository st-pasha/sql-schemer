import { describe, test, expect } from "bun:test";
import { unquote } from "../src/utils.ts";

describe("unquote()", () => {
  test("Empty string", () => {
    expect(unquote("''")).toBe("");
    expect(unquote('""')).toBe("");
  });

  test("Simple string", () => {
    expect(unquote("'Hello, world!'")).toBe("Hello, world!");
    expect(unquote('"Hello, world!"')).toBe("Hello, world!");
  });

  test("String with escaped quotes", () => {
    expect(unquote("'Hello, ''world''!'")).toBe("Hello, 'world'!");
  });

  test("Invalid: no quotes", () => {
    expect(() => unquote("Hello, world!")).toThrow(
      "Invalid quoted string: (Hello, world!)"
    );
  });

  test("Invalid: mismatched quotes", () => {
    expect(() => unquote("'Hello, world!\"")).toThrow(
      "Invalid quoted string: ('Hello, world!\")"
    );
  });

  test("Invalid: too short", () => {
    expect(() => unquote("'")).toThrow("Invalid quoted string: (')");
    expect(() => unquote('"')).toThrow('Invalid quoted string: (")');
  });
});
