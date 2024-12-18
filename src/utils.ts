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
