import { type StatementInfo } from "./types.ts";
import { splitIntoLines } from "./utils.ts";


export function parseSql(text: string): Array<StatementInfo> {
  const out: Array<StatementInfo> = [];
  const lines = splitIntoLines(text);

  let currentComment = "";
  let currentStatement = "";
  let inMultilineComment = false;
  let mode: "comment" | "statement" = "comment";

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (mode === "comment") {
      if (inMultilineComment) {
        currentComment += line;
        if (trimmedLine.endsWith("*/")) {
          inMultilineComment = false;
        }
        continue;
      }
      if (trimmedLine === "" || trimmedLine.startsWith("--")) {
        currentComment += line;
        continue;
      }
      if (trimmedLine.startsWith("/*")) {
        inMultilineComment = !trimmedLine.endsWith("*/");
        currentComment += line;
        continue;
      }
      mode = "statement";
    }

    if (mode === "statement") {
      currentStatement += line;
      if (inMultilineComment) {
        if (trimmedLine.endsWith("*/")) {
          inMultilineComment = false;
        }
        continue;
      }
      if (trimmedLine.startsWith("/*")) {
        inMultilineComment = !trimmedLine.endsWith("*/");
        continue;
      }
      if (trimmedLine.endsWith(";")) {
        const info = parseStatement(currentStatement, currentComment);
        out.push(info);
        mode = "comment";
        currentComment = "";
        currentStatement = "";
        continue;
      }
    }
  }
  if (mode === "comment") {
    if (currentComment !== "") {
      out.push({
        type: "whitespace",
        name: null,
        comment: currentComment,
        definition: "",
        fields: null,
      });
    }
  }
  if (mode === "statement") {
    const info = parseStatement(currentStatement, currentComment);
    out.push(info);
  }

  return out;
}

function parseStatement(text: string, comment: string): StatementInfo {
    const matchCreateTable = text.match(/CREATE TABLE\s+(\w+|"[^"]+")/i);

    if (matchCreateTable) {
        const name = matchCreateTable[1];
        return {
            type: "create table",
            name: name,
            comment: comment,
            definition: text,
            fields: [],
        };
    } else {
        return {
            type: "unknown",
            name: null,
            comment: comment,
            definition: text,
            fields: null,
        };
    }
}
