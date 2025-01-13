import fs from "node:fs";
import { statementTypeToSqlType } from "./types.ts";
import { type SqlObject } from "./types.ts";
import { parseSql } from "./parse-sql.ts";

export function readSchemaFromFile(filename: string): SqlObject[] {
  if (!fs.existsSync(filename)) {
    return [];
  }
  const schema: SqlObject[] = [];
  const sql = fs.readFileSync(filename, "utf-8");
  const [tokens, statements] = parseSql(sql);
  for (const statement of statements) {
    const objectType = statementTypeToSqlType(statement.type);
    schema.push({
      type: objectType,
      name: statement.name,
      tokens: tokens,
      statement: statement,
      source: filename,
    });
  }
  return schema;
}
