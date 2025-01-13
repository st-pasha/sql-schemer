import { assert } from "./utils.ts";
import { parseSql } from "./parse-sql.ts";
import type { SqlObject } from "./types.ts";
import type { DbAdapter } from "./types.ts";

// import fs from "node:fs";
  // public saveToFile(filename: string) {
  //   const schema = this.loadSchema();
  //   const schemaSql = schema.map((obj: any) => obj.sql).join(";\n\n") + "\n";
  //   fs.writeFileSync(filename, schemaSql);
  //   return this;
  // }



export function readSchemaFromSqlite(db: DbAdapter): SqlObject[] {
  // See https://www.sqlite.org/schematab.html
  //   type: "table", "index", "view", "trigger";
  //   name: the name of the object;
  //   tbl_name: the name of the table that the object is associated with, for
  //       indices, and triggers; same as `name` for tables and views;
  //   sql: the normalized SQL text of the command that created the object,
  //       including any subsequent modifications.
  const rows = db.selectAll(`
      SELECT type, name, tbl_name, sql 
      FROM sqlite_schema;
  `) as Array<{
    type: "table" | "index" | "view" | "trigger";
    name: string;
    tbl_name: string;
    sql: string;
  }>;
  const schema: Array<SqlObject> = [];
  for (const row of rows) {
    assert(
      ["table", "index", "view", "trigger"].includes(row.type),
      `Unknown object type: ${row.type}`
    );
    const [tokens, statements] = parseSql(row.sql);
    assert(statements.length === 1, `Invalid SQL statement: ${row.sql}`);
    if (tokens[tokens.length - 1].value !== ";") {
      tokens.push({ type: "PUNCT", value: ";" });
    }
    schema.push({
      type: row.type, 
      name: row.name, 
      tokens: tokens,
      statement: statements[0],
      source: "db"
    });
  }
  return schema;
}
