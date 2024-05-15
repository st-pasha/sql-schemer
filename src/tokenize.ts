type Token =
  | { type: "COMMENT"; value: string }
  | { type: "PUNCT"; value: string }
  | { type: "WORD"; value: string }
  | { type: "KEYWORD"; value: string }
  | { type: "STRING"; value: string }
  | { type: "OTHER"; value: string };

const keywords = new Set([
  "ABORT",
  "ACTION",
  "ADD",
  "AFTER",
  "ALL",
  "ALTER",
  "ALWAYS",
  "ANALYZE",
  "AND",
  "AS",
  "ASC",
  "ATTACH",
  "AUTOINCREMENT",
  "BEFORE",
  "BEGIN",
  "BETWEEN",
  "BY",
  "CASCADE",
  "CASE",
  "CAST",
  "CHECK",
  "COLLATE",
  "COLUMN",
  "COMMIT",
  "CONFLICT",
  "CONSTRAINT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "DATABASE",
  "DEFAULT",
  "DEFERRABLE",
  "DEFERRED",
  "DELETE",
  "DESC",
  "DETACH",
  "DISTINCT",
  "DO",
  "DROP",
  "EACH",
  "ELSE",
  "END",
  "ESCAPE",
  "EXCEPT",
  "EXCLUDE",
  "EXCLUSIVE",
  "EXISTS",
  "EXPLAIN",
  "FAIL",
  "FILTER",
  "FIRST",
  "FOLLOWING",
  "FOR",
  "FOREIGN",
  "FROM",
  "FULL",
  "GENERATED",
  "GLOB",
  "GROUP",
  "GROUPS",
  "HAVING",
  "IF",
  "IGNORE",
  "IMMEDIATE",
  "IN",
  "INDEX",
  "INDEXED",
  "INITIALLY",
  "INNER",
  "INSERT",
  "INSTEAD",
  "INTERSECT",
  "INTO",
  "IS",
  "ISNULL",
  "JOIN",
  "KEY",
  "LAST",
  "LEFT",
  "LIKE",
  "LIMIT",
  "MATCH",
  "MATERIALIZED",
  "NATURAL",
  "NO",
  "NOT",
  "NOTHING",
  "NOTNULL",
  "NULL",
  "NULLS",
  "OF",
  "OFFSET",
  "ON",
  "OR",
  "ORDER",
  "OTHERS",
  "OUTER",
  "OVER",
  "PARTITION",
  "PLAN",
  "PRAGMA",
  "PRECEDING",
  "PRIMARY",
  "QUERY",
  "RAISE",
  "RANGE",
  "RECURSIVE",
  "REFERENCES",
  "REGEXP",
  "REINDEX",
  "RELEASE",
  "RENAME",
  "REPLACE",
  "RESTRICT",
  "RETURNING",
  "RIGHT",
  "ROLLBACK",
  "ROW",
  "ROWS",
  "SAVEPOINT",
  "SELECT",
  "SET",
  "TABLE",
  "TEMP",
  "TEMPORARY",
  "THEN",
  "TIES",
  "TO",
  "TRANSACTION",
  "TRIGGER",
  "UNBOUNDED",
  "UNION",
  "UNIQUE",
  "UPDATE",
  "USING",
  "VACUUM",
  "VALUES",
  "VIEW",
  "VIRTUAL",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
  "WITHOUT",
]);

function tokenize(text: string): Array<Token> {
  let out: Array<Token> = [];
  let i = 0;

  while (i < text.length) {
    const i0 = i;
    i += newlineLength(text, i0);
    if (i > i0) continue;

    // Single-line comment
    if (text.slice(i, i + 2) === "--") {
      while (i < text.length && newlineLength(text, i) == 0) i++;
      i += newlineLength(text, i);
      out.push({ type: "COMMENT", value: text.slice(i0, i) });
    }
    // Multi-line comment
    else if (text.slice(i, i + 2) == "/*") {
      while (i < text.length) {
        if (text.slice(i, i + 2) == "*/") {
          i += 2;
          break;
        }
        i++;
      }
      out.push({ type: "COMMENT", value: text.slice(i0, i) });
    } else {
      const ch0 = text[i];
      if (ch0 === "'" || ch0 == '"') {
        const pos0 = i;
        i++;
        while (i < text.length) {
          const ch1 = text[i];
          i++;
          if (ch1 === ch0) {
            if (text[i] !== ch0) break;
            i++;
          }
        }
        out.push({ type: "STRING", value: text.slice(pos0, i) });
      } else if (/\s/.test(ch0)) {
        i++;
      } else if (/[\(\).,;]/.test(ch0)) {
        out.push({ type: "PUNCT", value: ch0 });
        i++;
      } else if (/\w/.test(ch0)) {
        const pos0 = i;
        while (i < text.length && /\w/.test(text[i])) i++;
        const word = text.slice(pos0, i);
        const ucWord = word.toUpperCase();
        if (keywords.has(ucWord)) {
          out.push({ type: "KEYWORD", value: ucWord });
        } else {
          out.push({ type: "WORD", value: word });
        }
      } else {
        out.push({ type: "OTHER", value: ch0 });
        i++;
      }
    }
  }
  return out;
}


/// Returns the length of newline sequence found at position [pos] within 
/// the [text]. If there is no newline at that position, returns 0.
///
function newlineLength(text: string, pos: number): number {
  const ch0 = text[pos];
  if (ch0 === "\n") return 1;
  if (ch0 === "\r" && text[pos + 1] === "\n") return 2;
  return 0;
}

export { tokenize };
