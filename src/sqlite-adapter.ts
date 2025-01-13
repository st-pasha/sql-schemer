import type { DbAdapter } from "./types.ts";

/**
 * Function that allows access to a SQLite database using either `bun:sqlite`
 * or `sqlite3` modules, depending on the runtime.
 */
export function sqliteAdapter(dbName: string): DbAdapter {
  const isBun = typeof Bun !== "undefined";
  const isNode = typeof process !== "undefined" && process.versions?.node;

  if (isBun) {
    const { Database } = require("bun:sqlite");
    const db = new Database(dbName);

    return {
      close: () => db.close(),
      run: (sql: string) => db.run(sql),
      selectAll: (sql: string) => db.query(sql).all(),
    };
  } else if (isNode) {
    // When running in Node, the `sqlite3` package is required
    const { Database } = require("sqlite3");
    const db = new Database(dbName);

    return {
      close: () => db.close(),
      run: (sql: string) => {
        let done = false;
        db.run(sql, (err: Error | null) => {
          if (err) throw err;
          done = true;
        });
        loopWhile(() => !done);
      },
      selectAll: (sql: string) => {
        let rows: any[] = [];
        let done = false;
        db.all(sql, (err: Error | null, result: any[]) => {
          if (err) throw err;
          rows = result;
          done = true;
        });
        loopWhile(() => !done);
        return rows;
      },
    };
  } else {
    throw new Error("Unsupported runtime");
  }
}

function loopWhile(predicate: () => boolean): void {
  const waitArray = new Int32Array(new SharedArrayBuffer(4));
  while (predicate()) {
    Atomics.wait(waitArray, 0, 0, 100); // Block for 100ms or until woken up
  }
}
