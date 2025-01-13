import type { Token } from "./types.ts";

/**
 * Tokenizes the given SQL [text] into a list of tokens, preserving comments
 * and whitespace.
 *
 * The original text can be reconstructed by concatenating the `value` fields
 * of each token.
 */
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

/**
 * Returns the length of newline sequence found at position [pos] within
 * the [text]. If there is no newline at that position, returns 0.
 */
function newlineLength(text: string, pos: number): number {
  const ch0 = text.charCodeAt(pos);
  if (ch0 === 10) return 1;
  if (ch0 === 13 && text.charCodeAt(pos + 1) === 10) return 2;
  return 0;
}
