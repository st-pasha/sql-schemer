import fs from "node:fs";
import path from "path";
import { assert } from "./utils.ts";
import { parseSql } from "./parse-sql.ts";
import { statementTypeToSqlType, type DbAdapter } from "./types.ts";
import { Schema } from "./schema.ts";

export function readSchemaFromSqlite(db: DbAdapter): Schema {
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
  const schema = new Schema();
  for (const row of rows) {
    assert(
      ["table", "index", "view", "trigger"].includes(row.type),
      `Unknown object type: ${row.type}`
    );
    const [tokens, statements] = parseSql(row.sql);
    assert(statements.length === 1, `Invalid SQL statement: ${row.sql}`);
    if (tokens[tokens.length - 1].value !== ";") {
      tokens.push({ type: "PUNCT", value: ";" });
      statements[0].loc[1]++;
    }
    schema.addObject({
      type: row.type,
      name: row.name,
      tokens: tokens,
      statement: statements[0],
      source: "",
    });
  }
  return schema;
}

export function readSchemaFromFile(filename: string): Schema {
  const schema = new Schema();
  if (!fs.existsSync(filename)) {
    return schema;
  }
  const sql = fs.readFileSync(filename, "utf-8");
  const [tokens, statements] = parseSql(sql);
  for (const statement of statements) {
    const objectType = statementTypeToSqlType(statement.type);
    schema.addObject({
      type: objectType,
      name: statement.name,
      tokens: tokens,
      statement: statement,
      source: filename,
    });
  }
  return schema;
}

export function readSchemaFromDir(dirname: string): Schema {
  const schema = new Schema();
  const files = fs.readdirSync(dirname);
  const sqlFiles = files.filter((file) => path.extname(file) === ".sql");
  for (const file of sqlFiles) {
    const schema1 = readSchemaFromFile(path.join(dirname, file));
    for (const obj of schema1.objects) {
      schema.addObject(obj);
    }
  }
  return schema;
}
