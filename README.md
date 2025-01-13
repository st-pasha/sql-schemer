# sql-schemer

This module will open an sqlite database file, read the schemas of all 
available SQL objects, and store them into a `.sql` file or a set of
files. If the target file already exists, then it will attempt to keep
the existing formatting and comments as-is.

```typescript
import { saveSchemaToFile } from "sql-schemer";

saveSchemaToFile("./db/main.sqlite", "./db/main.sql");
```