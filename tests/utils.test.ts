import { describe, test, expect } from "bun:test";
import { splitIntoLines, unquote } from "../src/utils.ts";

describe("splitIntoLines()", () => {
  test("Empty line", () => {
    const parsed = splitIntoLines("");
    expect(parsed).toEqual([]);
  });

  test("Whitespace line", () => {
    const parsed = splitIntoLines("  \t ");
    expect(parsed).toEqual(["  \t "]);
  });

  test("Multiple empty lines", () => {
    const parsed1 = splitIntoLines("\n\r\r\n");
    const parsed2 = splitIntoLines("\n\r\r\n", false);
    expect(parsed1).toEqual(["\n", "\r", "\r\n"]);
    expect(parsed2).toEqual(["", "", ""]);
  });

  test("Single line", () => {
    const parsed = splitIntoLines("Hello, world!");
    expect(parsed).toEqual(["Hello, world!"]);
  });

  test("Single line with a newline", () => {
    const text = "Hello, world!\r\n";
    const parsed1 = splitIntoLines(text);
    const parsed2 = splitIntoLines(text, false);
    expect(parsed1).toEqual(["Hello, world!\r\n"]);
    expect(parsed2).toEqual(["Hello, world!"]);
  });

  test("Multiple lines", () => {
    const text = "One\nTwo\r\nThree Four\nFive";
    const parsed1 = splitIntoLines(text, true);
    const parsed2 = splitIntoLines(text, false);
    expect(parsed1).toEqual(["One\n", "Two\r\n", "Three Four\n", "Five"]);
    expect(parsed2).toEqual(["One", "Two", "Three Four", "Five"]);
  });
});

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
