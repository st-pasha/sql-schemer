import type {
  CreateTableStatement,
  Location,
  SqlObject,
  Token,
} from "./types.ts";
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
  // if (obj1.type === "table" && obj2.type === "table") {
  //   return updateTable(obj1, obj2);
  // }
  const tokens1 = extractSignificantTokens(obj1);
  const tokens2 = extractSignificantTokens(obj2);
  if (!compareTokens(tokens1, tokens2)) {
    clearTokens(obj1.tokens, obj1.statement.loc); 
    const token0 = obj1.tokens[obj1.statement.loc[0]];
    token0.value = extractSqlText(obj2.tokens, obj2.statement.loc);
    return true;
  }
  return false;
}

function extractSignificantTokens(obj: SqlObject): Token[] {
  const loc = obj.statement.loc;
  const out: Token[] = [];
  for (let i = loc[0]; i < loc[1]; i++) {
    const token = obj.tokens[i];
    if (token.type === "WHITESPACE" || token.type === "COMMENT") {
      continue;
    }
    out.push(token);
  }
  return out;
}

function compareTokens(tokens1: Token[], tokens2: Token[]): boolean {
  if (tokens1.length !== tokens2.length) {
    return false;
  }
  for (let i = 0; i < tokens1.length; i++) {
    const token1 = tokens1[i];
    const token2 = tokens2[i];
    if (token1.type !== token2.type) return false;
    if (token1.type === "WORD") {
      if (token1.value.toUpperCase() !== token2.value.toUpperCase()) {
        return false;
      }
    } else {
      if (token1.value !== token2.value) return false;
    }
  }
  return true;
}

function clearTokens(tokens: Token[], loc: Location) {
  for (let i = loc[0]; i < loc[1]; i++) {
    tokens[i].value = "";
  }
}

function extractSqlText(tokens: Token[], loc: Location): string {
  let out = "";
  for (let i = loc[0]; i < loc[1]; i++) {
    out += tokens[i].value;
  }
  return out;
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
