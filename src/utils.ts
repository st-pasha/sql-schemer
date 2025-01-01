export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function splitIntoLines(
  text: string,
  keepEnds: boolean = true
): Array<string> {
  const out: Array<string> = [];
  const n = text.length;
  let i0 = 0;
  for (let i = 0; i < n; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 10) {
      out.push(text.substring(i0, i + (keepEnds ? 1 : 0)));
      i0 = i + 1;
    } else if (ch === 13) {
      const newlineLength = text.charCodeAt(i + 1) === 10 ? 2 : 1;
      out.push(text.substring(i0, i + (keepEnds ? newlineLength : 0)));
      i0 = i + newlineLength;
      i = i0 - 1;
    }
  }
  if (i0 < n) {
    out.push(text.substring(i0, n));
  }
  return out;
}

/// Unquote a SQL-quoted string. The string must start and end with the same
/// quote character (either single or double quote). Any escaped quotes will
/// be unescaped.
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
