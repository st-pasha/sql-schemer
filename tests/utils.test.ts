import { describe, test, expect } from "bun:test";
import { splitIntoLines } from "../src/utils";

describe("splitIntoLines", () => {
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
