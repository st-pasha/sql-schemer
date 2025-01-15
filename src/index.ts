import * as fs from "fs";
import {
  readSchemaFromSqlite,
  readSchemaFromFile,
  readSchemaFromDir,
} from "./read-schema.ts";
import { sqliteAdapter } from "./sqlite-adapter.ts";
import { type SqlObject } from "./types.ts";

export function saveSchemaToFile(db: string, filename: string): boolean {
  const dbAdapter = sqliteAdapter(db);
  const schemaNew = readSchemaFromSqlite(dbAdapter);
  const schemaOld = readSchemaFromFile(filename);
  const changed = schemaOld.updateSchema(schemaNew, () => filename);
  if (changed) {
    const tokens = schemaOld.sources.get(filename)!;
    const sql = tokens.map((t) => t.value).join("");
    fs.writeFileSync(filename, sql);
  }
  dbAdapter.close();
  return changed;
}

export function saveSchemaToDir(db: string, dirname: string): boolean {
  const dbAdapter = sqliteAdapter(db);
  const schemaNew = readSchemaFromSqlite(dbAdapter);
  const schemaOld = readSchemaFromDir(dirname);
  const targetFn = (obj: SqlObject): string => {
    return `${dirname}/${obj.name}.sql`;
  };
  const changed = schemaNew.updateSchema(schemaOld, targetFn);
  if (changed) {
    for (const source of schemaOld.changedSources) {
      const tokens = schemaOld.sources.get(source)!;
      const sql = tokens.map((t) => t.value).join("");
      fs.writeFileSync(source, sql);
    }
  }
  dbAdapter.close();
  return changed;
}
