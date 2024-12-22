
import fs from "node:fs/promises";


async function makeTarget(dest: string): Promise<Target> {
    if (dest.length === 0) {
      throw new Error("The name of the target file/directory cannot be empty");
    }
    if (!(await fs.exists(dest))) {
      if (dest.endsWith(".sql")) {
        await fs.writeFile(dest, "");
      } else {
        await fs.mkdir(dest, { recursive: true });
      }
    }
    const stats = await fs.stat(dest);
    if (stats.isDirectory()) {
      return new MultiFileTarget(dest);
    } else if (stats.isFile()) {
      return new SingleFileTarget(dest);
    } else {
      throw new Error(`Path ${dest} is neither a file nor a directory`);
    }
}


abstract class Target {
  constructor() { }

  abstract readSources(): Promise<undefined>;
}


class SingleFileTarget extends Target {
  private readonly path: string;
  private content: string | null;

  constructor(path: string) {
    super();
    this.path = path;
    this.content = null;
  }

  async readSources(): Promise<undefined> {
    this.content = await fs.readFile(this.path, {encoding: "utf-8"});
  }
}


class MultiFileTarget extends Target {
  private readonly root: string;

  constructor(root: string) {
    super();
    this.root = root;
  }
}



export { makeTarget, Target };
