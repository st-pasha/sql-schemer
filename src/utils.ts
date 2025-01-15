export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/** 
 * Unquote a SQL-quoted string. The string must start and end with the same
 * quote character (either single or double quote). Any escaped quotes will
 * be unescaped.
 */
export function unquote(text: string): string {
  const n = text.length;
  const quote = text.charCodeAt(0);
  assert(
    n >= 2 &&
      quote === text.charCodeAt(n - 1) &&
      (quote === 34 || quote === 39),
    "Invalid quoted string: (" + text + ")"
  );
  const fragments: Array<string> = [];
  let i0 = 1;
  for (let i = 1; i < n - 1; i++) {
    const ch = text.charCodeAt(i);
    if (ch === quote) {
      fragments.push(text.substring(i0, i));
      i++;
      i0 = i;
    }
  }
  if (i0 < n - 1) {
    fragments.push(text.substring(i0, n - 1));
  }
  return fragments.join("");
}
