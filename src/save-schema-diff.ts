import { type SqlObject } from "./types.ts";
import { type SchemaEdit } from "./types.ts";
import fs from "fs";

export function saveSchemaDiff(
  diff: SchemaEdit[],
  targetFn: (obj: SqlObject) => string
) {
  for (const edit of diff) {
    if (edit.type === "add") {
      const obj = edit.newObject;
      const sql = "\n\n" + obj.tokens.map((t) => t.value).join("") + "\n";
      const targetFile = targetFn(obj);
      fs.appendFileSync(targetFile, sql);
    } else if (edit.type === "remove") {
      const obj = edit.oldObject;
      for (let i = obj.statement.loc[0]; i < obj.statement.loc[1]; i++) {
        obj.tokens[i].value = "";
      }
      const sql = obj.tokens.map((t) => t.value).join("");
      fs.writeFileSync(obj.source, sql);
    }
  }
}
