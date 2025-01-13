import type { CreateTableStatement, SqlObject } from "./types.ts";
import { assert } from "./utils.ts";

/**
 * Updates `obj1` to match `obj2`, returning `true` if any changes were made.
 * Both SQL objects must have the same type and name.
 *
 * The way an object is updated is by rewriting its tokens so that they match
 * the intended SQL text, but minimizing the number of changes made.
 */
export function updateObject(obj1: SqlObject, obj2: SqlObject): boolean {
  assert(obj1.type === obj2.type, "Object types must match");
  assert(obj1.name === obj2.name, "Object names must match");
  if (obj1.type === "table" && obj2.type === "table") {
    return updateTable(obj1, obj2);
  }
  return false;
}

function updateTable(obj1: SqlObject, obj2: SqlObject): boolean {
  assert(obj1.statement.type === "create-table-statement", "");
  assert(obj2.statement.type === "create-table-statement", "");
  const stmt1 = obj1.statement as CreateTableStatement;
  const stmt2 = obj2.statement as CreateTableStatement;

  const updateColumns = (): boolean => {
    return false;
  };
  const updateConstraints = (): boolean => {
    return false;
  };
  const updateOptions = (): boolean => {
    const options1 = stmt1.options;
    const options2 = stmt2.options;
    for (const opt1 of options1) {
    
    }
    return false;
  };

  // Don't short-circuit these calls, as we want to run all of them
  const r0 = updateColumns();
  const r1 = updateConstraints();
  const r2 = updateOptions();
  return r0 || r1 || r2;
}
