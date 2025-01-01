import { tokenize, type Token } from "./tokenize.ts";
import {
  type SqlStatement,
  type TableOption,
  type ColumnType as TypeName,
  type ColumnConstraint,
  type ConflictClause,
  type ColumnDef,
  type TableConstraint,
  type CreateTableStatement,
  type UnknownStatement,
} from "./types.ts";
import { unquote } from "./utils.ts";

export function parseSql(text: string): [Array<Token>, Array<SqlStatement>] {
  const tokens = tokenize(text);
  const n = tokens.length;
  let i = 0;

  const advance = (): boolean => {
    assert(i < n, "Unexpected end of input");
    i++;
    return true;
  };

  const atWhitespace = (): boolean => {
    const tt = tokens[i]?.type;
    return tt === "WHITESPACE" || tt === "COMMENT";
  };

  const atKeyword = (text: string): boolean => {
    const tt = tokens[i]?.type;
    return tt === "WORD" && tokens[i].value.toUpperCase() === text;
  };

  const atPunct = (text: string): boolean => {
    const tt = tokens[i]?.type;
    return tt === "PUNCT" && tokens[i].value === text;
  };

  const skipWhitespace = (): boolean => {
    while (atWhitespace()) advance();
    return true;
  };

  /// If keyword `kw` is present at the current position, then skip it and
  /// return true; otherwise return false. The `kw` must be in upper case.
  const skipKeyword = (kw: string): boolean => {
    skipWhitespace();
    return atKeyword(kw) && advance();
  };

  const skipPunct = (text: string): boolean => {
    skipWhitespace();
    return atPunct(text) && advance();
  };

  /// Parses a table name, which may also have a schema name.
  const parseTableName = (): string => {
    let result = parseName();
    assert(result !== null, "Expected a table name");
    if (skipPunct(".")) {
      const name2 = parseName();
      assert(name2 !== null, "Expected a table name");
      result += "." + name2;
    }
    return result;
  };

  /// column-def := column-name type-name? column-constraint*
  const parseColumnDef = (): ColumnDef | null => {
    const start = i;
    const name = parseName();
    if (name !== null) {
      const type = parseTypeName();
      const constraints = [];
      while (true) {
        const constraint = parseColumnConstraint();
        if (constraint === null) break;
        constraints.push(constraint);
      }
      return {
        type: "column-def",
        name: name,
        columnType: type,
        constraints: constraints,
        loc: [start, i],
      };
    }
    return null;
  };

  const parseName = (): string | null => {
    return parseBareWord() || parseQuotedWord();
  };

  const parseBareWord = (): string | null => {
    skipWhitespace();
    const t0 = tokens[i]?.type;
    if (t0 === "WORD") {
      const result = tokens[i].value;
      advance();
      return result;
    }
    return null;
  };

  const parseQuotedWord = (): string | null => {
    skipWhitespace();
    const t0 = tokens[i]?.type;
    if (t0 === "STRING") {
      const result = unquote(tokens[i].value);
      advance();
      return result;
    }
    return null;
  };

  /// type-name := name+ (
  ///   '(' signed-number ')' |
  ///   '(' signed-number ',' signed-number ')'
  /// )?
  const parseTypeName = (): TypeName | null => {
    const i0 = i;
    const name = parseBareWord();
    if (name !== null) {
      let expr1 = null;
      let expr2 = null;
      if (skipPunct("(")) {
        expr1 = parseExpr();
        if (skipPunct(",")) {
          expr2 = parseExpr();
        }
        const hasCloseParen = skipPunct(")");
        assert(hasCloseParen, "Expected closing parenthesis");
      }
      return {
        type: "type-name",
        name: name.toUpperCase(),
        expr1: expr1,
        expr2: expr2,
        loc: [i0, i],
      };
    }
    return null;
  };

  const parseExpr = (): string | null => {
    let expr = "";
    let parenthesisLevel = 0;
    while (i < n) {
      const text = tokens[i].value;
      if (parenthesisLevel > 0) {
        if (text === "(") parenthesisLevel++;
        if (text === ")") parenthesisLevel--;
        if (text === ";") break;
      } else {
        if (text === "(") parenthesisLevel++;
        if (text === ")" || text === "," || text === ";") break;
      }
      expr += text;
      advance();
    }
    assert(parenthesisLevel === 0, "Unbalanced parenthesis");
    if (expr === "") return null;
    return expr;
  };

  // column-constraint := (CONSTRAINT name)? (
  //   PRIMARY KEY (ASC|DESC)? conflict-clause? AUTOINCREMENT? |
  //   NOT NULL conflict-clause? |
  //   UNIQUE conflict-clause? |
  //   CHECK '(' expr ')' |
  //   DEFAULT ('(' expr ')'| literal | number) |
  //   COLLATE collation-name |
  //   foreign-key-clause |
  //   (GENERATED ALWAYS)? AS '(' expr ')' (STORED|VIRTUAL)?
  // )
  function parseColumnConstraint(): ColumnConstraint | null {
    const i0 = i;
    let name = null;
    if (skipKeyword("CONSTRAINT")) {
      name = parseName();
      assert(name !== null, "Expected constraint name");
    }
    if (skipKeyword("PRIMARY") && skipKeyword("KEY")) {
      const order = skipKeyword("ASC")
        ? "ASC"
        : skipKeyword("DESC")
        ? "DESC"
        : null;
      const conflict = parseConflictClause();
      const autoincrement = skipKeyword("AUTOINCREMENT");
      return {
        type: "column-constraint-primary-key",
        name: name,
        order: order,
        conflict: conflict,
        autoincrement: autoincrement,
        loc: [i0, i],
      };
    }
    if (skipKeyword("NOT") && skipKeyword("NULL")) {
      const conflict = parseConflictClause();
      return {
        type: "column-constraint-not-null",
        name: name,
        conflict: conflict,
        loc: [i0, i],
      };
    }
    if (skipKeyword("UNIQUE")) {
      const conflict = parseConflictClause();
      return {
        type: "column-constraint-unique",
        name: name,
        conflict: conflict,
        loc: [i0, i],
      };
    }
    i = i0;
    return null;
  }

  // conflict-clause := ON CONFLICT (ROLLBACK|ABORT|FAIL|IGNORE|REPLACE)
  function parseConflictClause(): ConflictClause | null {
    const kinds = ["ROLLBACK", "ABORT", "FAIL", "IGNORE", "REPLACE"] as const;
    const i0 = i;
    if (skipKeyword("ON") && skipKeyword("CONFLICT")) {
      for (const kw of kinds) {
        if (skipKeyword(kw)) {
          return {
            type: "conflict-clause",
            kind: kw,
            loc: [i0, i],
          };
        }
      }
    }
    i = i0;
    return null;
  }

  function parseTableConstraint(): TableConstraint | null {
    return null;
  }

  function parseOption(): TableOption | null {
    const start = i;
    if (skipKeyword("WITHOUT") && skipKeyword("ROWID")) {
      return {
        type: "table-option",
        text: "WITHOUT ROWID",
        loc: [start, i],
      };
    }
    if (skipKeyword("STRICT")) {
      return {
        type: "table-option",
        text: "STRICT",
        loc: [start, i],
      };
    }
    return null;
  }

  /// Parses a CREATE TABLE statement, according to
  /// https://www.sqlite.org/lang_createtable.html.
  ///
  /// We ignore the "CREATE TEMP TABLE" variant, because it can never be a part
  /// of a permanent schema.
  function parseCreateTable(): CreateTableStatement | null {
    const start = i;
    if (skipKeyword("CREATE") && skipKeyword("TABLE")) {
      skipKeyword("IF") && skipKeyword("NOT") && skipKeyword("EXISTS");
      skipWhitespace();
      const name = parseTableName();
      const openParen = skipPunct("(");
      assert(openParen, "Expected opening parenthesis");
      const columns = [];
      const constraints = [];
      while (true) {
        let column, constraint;
        if ((column = parseColumnDef()) !== null) {
          columns.push(column);
          if (skipPunct(",")) continue;
        } else if ((constraint = parseTableConstraint()) !== null) {
          constraints.push(constraint);
          if (skipPunct(",")) continue;
        }
        if (skipPunct(")")) break;
        assert(false, "Expected column definition or constraint");
      }
      skipWhitespace();
      const options: Array<TableOption> = [];
      while (!atPunct(";")) {
        const option = parseOption();
        assert(option !== null, "Unknown table option");
        options.push(option);
        skipPunct(",") && skipWhitespace();
      }
      skipPunct(";");
      return {
        type: "create-table-statement",
        name: name,
        columns: columns,
        constraints: constraints,
        options: options,
        loc: [start, i],
      };
    }
    return null;
  }

  function parseUnknownStatement(): UnknownStatement {
    const i0 = i;
    const fragments = [];
    while (i < n) {
      if (skipPunct(";")) {
        break;
      }
      if (!atWhitespace()) {
        fragments.push(tokens[i].value);
      }
      advance();
    }
    return {
      type: "unknown-statement",
      tokens: fragments,
      loc: [i0, i],
    };
  }

  function getCurrentTokenPosition(): [number, number, string] {
    let line = 1;
    let col = 1;
    let lineText = "";
    for (let j = 0; j < i; j++) {
      const text = tokens[j].value;
      let lineStart = 0;
      for (let k = 0; k < text.length; k++) {
        const ch = text.charCodeAt(k);
        if (ch === 10 || ch == 13) {
          if (ch === 13 && text.charCodeAt(k + 1) === 10) k++;
          line++;
          col = 1;
          lineText = "";
          lineStart = k + 1;
        } else {
          col++;
        }
      }
      if (lineStart > 0) {
        lineText = text.slice(lineStart);
      } else {
        lineText += text;
      }
    }
    let stop = false;
    for (let j = i; j < n; j++) {
      const text = tokens[j].value;
      for (let k = 0; k < text.length; k++) {
        const ch = text.charCodeAt(k);
        if (ch === 10 || ch == 13) {
          lineText += text.slice(0, k);
          stop = true;
          break;
        }
      }
      if (stop) break;
      lineText += text;
    }
    return [line, col, lineText];
  }

  function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
      const [line, col, lineText] = getCurrentTokenPosition();
      message += `\nat line ${line}, column ${col}:`;
      message += `\n  ${lineText}`;
      message += `\n  ${" ".repeat(col - 1)}^`;
      throw new Error(message);
    }
  }

  const statements: Array<SqlStatement> = [];
  while (i < n) {
    const statement = parseCreateTable() || parseUnknownStatement();
    statements.push(statement);
  }
  return [tokens, statements];
}
