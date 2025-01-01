export type Token =
  | { type: "COMMENT"; value: string }
  | { type: "PUNCT"; value: string }
  | { type: "WORD"; value: string }
  | { type: "STRING"; value: string }
  | { type: "OTHER"; value: string }
  | { type: "WHITESPACE"; value: string };

/// Tokenizes the given SQL [text] into a list of tokens, preserving comments
/// and whitespace.
///
/// The original text can be reconstructed by concatenating the `value` fields
/// of each token.
export function tokenize(text: string): Array<Token> {
  const n = text.length;
  const out: Array<Token> = [];
  let i = 0;

  while (i < n) {
    const i0 = i;
    const ch1 = text.charAt(i);
    const ch2 = text.slice(i, i + 2);

    // Whitespace
    if (/\s/.test(ch1)) {
      while (i < n && /\s/.test(text[i])) i++;
      out.push({ type: "WHITESPACE", value: text.slice(i0, i) });
      continue;
    }

    // Single-line comment
    if (ch2 === "--") {
      while (i < n && newlineLength(text, i) == 0) i++;
      i += newlineLength(text, i);
      out.push({ type: "COMMENT", value: text.slice(i0, i) });
      continue;
    }

    // Multi-line comment
    if (ch2 === "/*") {
      while (i < n) {
        if (text.slice(i, i + 2) === "*/") {
          i += 2;
          break;
        }
        i++;
      }
      out.push({ type: "COMMENT", value: text.slice(i0, i) });
      continue;
    }

    // Single- or double- quoted string
    if (ch1 === "'" || ch1 === '"') {
      i++;
      while (i < n) {
        if (text.charAt(i) === ch1) {
          if (text.charAt(i + 1) === ch1) {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      out.push({ type: "STRING", value: text.slice(i0, i) });
      continue;
    }

    // Punctuation
    if (/[\(\)\[\]\$.,;#@]/.test(ch1)) {
      i++;
      out.push({ type: "PUNCT", value: ch1 });
      continue;
    }

    // Bare-words
    if (/\w/.test(ch1)) {
      while (i < n && /\w/.test(text[i])) i++;
      const word = text.slice(i0, i);
      out.push({ type: "WORD", value: word });
      continue;
    }

    // Everything else
    i++;
    out.push({ type: "OTHER", value: ch1 });
  }
  return out;
}

/// Returns the length of newline sequence found at position [pos] within
/// the [text]. If there is no newline at that position, returns 0.
///
function newlineLength(text: string, pos: number): number {
  const ch0 = text.charCodeAt(pos);
  if (ch0 === 10) return 1;
  if (ch0 === 13 && text.charCodeAt(pos + 1) === 10) return 2;
  return 0;
}

/*
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
*/
