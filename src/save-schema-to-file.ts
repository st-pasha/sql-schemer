import { diffSchemas } from "./diff-schemas.ts";
import { readSchemaFromFile } from "./read-schema-from-file.ts";
import { readSchemaFromSqlite } from "./read-schema-from-sqlite.ts";
import { saveSchemaDiff } from "./save-schema-diff.ts";
import { sqliteAdapter } from "./sqlite-adapter.ts";

export function saveSchemaToFile(db: string, filename: string): boolean {
  const dbAdapter = sqliteAdapter(db);
  const schemaNew = readSchemaFromSqlite(dbAdapter);
  const schemaOld = readSchemaFromFile(filename);
  const diff = diffSchemas(schemaOld, schemaNew);
  if (diff.length > 0) {
    saveSchemaDiff(diff, () => filename);
  }
  dbAdapter.close();
  return diff.length > 0;
}
