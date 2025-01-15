import type { SqlObject, Token } from "./types.ts";
import { updateObject } from "./update-object.ts";
import { assert } from "./utils.ts";

export class Schema {
  objects: SqlObject[];
  sources: Map<string, Token[]>;
  objectMap: Map<string, SqlObject>;
  changedSources: Set<string>;

  constructor() {
    this.objects = [];
    this.sources = new Map();
    this.objectMap = new Map();
    this.changedSources = new Set();
  }

  addObject(obj: SqlObject): void {
    const objKey = obj.type + "/" + obj.name;
    assert(!this.objectMap.has(objKey), `Object already exists: ${objKey}`);
    this.objects.push(obj);
    this.objectMap.set(objKey, obj);
    if (obj.source !== "") {
      if (this.sources.has(obj.source)) {
        const tokens = this.sources.get(obj.source)!;
        assert(tokens === obj.tokens, `Source tokens do not match`);
      } else {
        this.sources.set(obj.source, obj.tokens);
      }
    }
  }

  /**
   * Updates the contents of this schema to match the new schema, returning
   * true if any changes were made. The set of sources that were changed
   * during this operation is stored in the `changedSources` field.
   * 
   * This operation also updates the tokens of any source file where an object
   * is added, removed, or modified.
   */
  updateSchema(
    newSchema: Schema,
    newTargetFn: (o: SqlObject) => string
  ): boolean {
    assert(this.changedSources.size === 0, "Schema has pending changes");
    const visited = new Set<string>();
    for (const [objKey, obj] of newSchema.objectMap) {
      const existingObj = this.objectMap.get(objKey);
      visited.add(objKey);
      // Add a new object into the schema
      if (existingObj === undefined) {
        this.addObject(obj);
        const target = newTargetFn(obj);
        if (this.sources.has(target)) {
          const tokens = this.sources.get(target)!;
          tokens.push({ type: "WHITESPACE", value: "\n\n" });
          tokens.push(...obj.tokens);
        } else {
          this.sources.set(target, [...obj.tokens]);
        }
        this.changedSources.add(target);
      }
      // An object already exists, see if it needs to be updated
      else {
        const changed = updateObject(existingObj, obj);
        if (changed) {
          this.changedSources.add(obj.source);
        }
      }
    }
    for (const [objKey, obj] of this.objectMap) {
      // Remove an object from the current schema, since it doesn't exist
      // in the new schema
      if (!visited.has(objKey)) {
        for (let i = obj.statement.loc[0]; i < obj.statement.loc[1]; i++) {
          obj.tokens[i].value = "";
        }
        this.changedSources.add(obj.source);
        this.objectMap.delete(objKey);
      }
    }
    return this.changedSources.size > 0;
  }
}
