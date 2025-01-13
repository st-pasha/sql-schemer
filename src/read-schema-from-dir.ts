import fs from "node:fs";
import path from "node:path";
import { readSchemaFromFile } from "./read-schema-from-file.ts";
import { type SqlObject } from "./types.ts";

export function readSchemaFromDir(dirname: string): SqlObject[] {
  const files = fs.readdirSync(dirname);
  const sqlFiles = files.filter((file) => path.extname(file) === ".sql");
  const sqlObjects = sqlFiles.flatMap((file) => {
    const data = fs.readFileSync(path.join(dirname, file), "utf8");
    return readSchemaFromFile(data);
  });
  return sqlObjects;
}
