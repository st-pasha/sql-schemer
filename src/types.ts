export type Token = {
  type: "COMMENT" | "PUNCT" | "WORD" | "STRING" | "OTHER" | "WHITESPACE";
  value: string;
};

export type SqlObject = {
  type: "table" | "index" | "view" | "trigger";
  name: string;

  // The array of tokens that were parsed from the SQL text of the object's
  // definition. Only the portion of the array given by the `statement.loc`
  // field should be considered to be the object's definition.
  tokens: Array<Token>;

  statement: SqlStatement;

  /// The name of the file where the object was found.
  source: string;
};

export type SqlStatement =
  | CreateTableStatement
  | CreateIndexStatement
  | CreateTriggerStatement
  | CreateViewStatement;

export type CreateTableStatement = {
  type: "create-table-statement";
  name: string;
  columns: Array<ColumnDef>;
  constraints: Array<TableConstraint>;
  options: Array<TableOption>;
  loc: Location;
  optionsLoc: Location;
};

export type CreateIndexStatement = {
  type: "create-index-statement";
  name: string;
  unique: boolean;
  ifNotExists: boolean;
  schemaName: string | null;
  tableName: string;
  columns: Array<IndexedColumn>; // not empty
  where: Expr | null;
  loc: Location;
};

export type CreateTriggerStatement = {
  type: "create-trigger-statement";
  name: string;
  ifNotExists: boolean;
  schemaName: string | null;
  tokens: Array<string>;
  loc: Location;
};

export type CreateViewStatement = {
  type: "create-view-statement";
  name: string;
  ifNotExists: boolean;
  schemaName: string | null;
  columns: Array<string>;
  selectStatement: Array<string>;
  loc: Location;
};

export type UnknownStatement = {
  type: "unknown-statement";
  tokens: Array<string>;
  loc: Location;
};

export type TableOption = {
  type: "table-option";
  text: string;
  loc: Location;
};

export type Location = [number, number];

export type ColumnDef = {
  type: "column-def";
  name: string;
  columnType: ColumnType | null;
  constraints: Array<ColumnConstraint>;
  loc: Location;
};

export type ColumnType = {
  type: "type-name";
  name: string;
  expr1: string | null;
  expr2: string | null;
  loc: Location;
};

export type ColumnConstraint =
  | ColumnConstraintPrimaryKey
  | ColumnConstraintNotNull
  | ColumnConstraintUnique;
//  | ColumnConstraintCheck | ColumnConstraintDefault | ColumnConstraintCollate | ColumnConstraintForeignKey;

export type ColumnConstraintPrimaryKey = {
  type: "column-constraint-primary-key";
  name: string | null;
  order: "ASC" | "DESC" | null;
  conflict: ConflictClause | null;
  autoincrement: boolean;
  loc: Location;
};

export type ColumnConstraintNotNull = {
  type: "column-constraint-not-null";
  name: string | null;
  conflict: ConflictClause | null;
  loc: Location;
};

export type ColumnConstraintUnique = {
  type: "column-constraint-unique";
  name: string | null;
  conflict: ConflictClause | null;
  loc: Location;
};

export type TableConstraint =
  | TableConstraintPrimaryKey
  | TableConstraintUnique
  | TableConstraintCheck
  | TableConstraintForeignKey;

export type TableConstraintPrimaryKey = {
  type: "table-constraint-primary-key";
  indexedColumns: Array<IndexedColumn>;
  conflict: ConflictClause | null;
  loc: Location;
};

export type TableConstraintUnique = {
  type: "table-constraint-unique";
  indexedColumns: Array<IndexedColumn>;
  conflict: ConflictClause | null;
  loc: Location;
};

export type TableConstraintCheck = {
  type: "table-constraint-check";
  expr: string;
  loc: Location;
};

export type TableConstraintForeignKey = {
  type: "table-constraint-foreign-key";
  columns: Array<string>;
  foreignTable: string;
  foreignColumns: Array<string>;
  actions: Array<ForeignKeyAction>;
  deferral: ForeignKeyDeferral | null;
  loc: Location;
};

export type ForeignKeyAction =
  | "ON DELETE SET NULL"
  | "ON DELETE SET DEFAULT"
  | "ON DELETE CASCADE"
  | "ON DELETE RESTRICT"
  | "ON DELETE NO ACTION"
  | "ON UPDATE SET NULL"
  | "ON UPDATE SET DEFAULT"
  | "ON UPDATE CASCADE"
  | "ON UPDATE RESTRICT"
  | "ON UPDATE NO ACTION"
  | `MATCH ${string}`;

export type ForeignKeyDeferral =
  | "DEFERRABLE"
  | "DEFERRABLE INITIALLY DEFERRED"
  | "DEFERRABLE INITIALLY IMMEDIATE"
  | "NOT DEFERRABLE"
  | "NOT DEFERRABLE INITIALLY DEFERRED"
  | "NOT DEFERRABLE INITIALLY IMMEDIATE";

export type IndexedColumn = {
  type: "indexed-column";
  name: string;
  collation: string | null;
  order: "ASC" | "DESC" | null;
  loc: Location;
};

export type ConflictClause = {
  type: "conflict-clause";
  kind: "ROLLBACK" | "ABORT" | "FAIL" | "IGNORE" | "REPLACE";
  loc: Location;
};

export type Expr = {
  type: "expr";
  tokens: Array<string>; // whitespace/comments are removed
  loc: Location;
};

export type DbAdapter = {
  close: () => void;
  run: (sql: string) => void;
  selectAll: (sql: string) => any[];
};

export type SchemaEdit =
  | {
      type: "add";
      newObject: SqlObject;
    }
  | {
      type: "modify";
      newObject: SqlObject;
      oldObject: SqlObject;
    }
  | {
      type: "remove";
      oldObject: SqlObject;
    };

export function statementTypeToSqlType(
  type: SqlStatement["type"]
): SqlObject["type"] {
  return type.slice(7, -10) as SqlObject["type"];
}
