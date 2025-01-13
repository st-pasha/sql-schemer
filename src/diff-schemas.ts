import { type SqlObject } from "./types.ts";
import { type SchemaEdit } from "./types.ts";
import { updateObject } from "./update-statement.ts";

/**
 * Compute a sequence of edits to transform `schema1` into `schema2`.
 *
 * Here `schema1` would normally be the current schema as stored on disk, and
 * `schema2` would be the actual schema read from the database.
 */
export function diffSchemas(
  schema1: SqlObject[],
  schema2: SqlObject[]
): SchemaEdit[] {
  const out: SchemaEdit[] = [];
  const schema1Map = new Map(
    schema1.map((obj) => [obj.type + "/" + obj.name, obj])
  );

  for (const obj of schema2) {
    const qualName = obj.type + "/" + obj.name;
    const schema1Obj = schema1Map.get(qualName);
    if (schema1Obj === undefined) {
      out.push({ type: "add", newObject: obj });
    } else {
      schema1Map.delete(qualName);
      const changed = updateObject(schema1Obj.statement, obj.statement);
      if (changed) {
        out.push({ type: "modify", oldObject: schema1Obj, newObject: obj });
      }
    }
  }
  for (const obj of schema1Map.values()) {
    out.push({ type: "remove", oldObject: obj });
  }
  return out;
}
