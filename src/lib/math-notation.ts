// Presentation-only prettifier for the un-delimited maths notation the AI emits
// in plain prose (sqrt(14), x^19, 5^-14, 13/4). No maths library handles
// un-delimited notation, so this substitutes a fixed, well-defined set of
// tokens for their Unicode equivalents. It never changes mathematical meaning:
// anything that does not match a known-safe pattern is left exactly as it was.

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  "+": "⁺",
};

function toSuperscript(run: string): string {
  let out = "";
  for (const ch of run) {
    const mapped = SUPERSCRIPT[ch];
    if (!mapped) return run; // unknown character: refuse rather than guess
    out += mapped;
  }
  return out;
}

/**
 * Improve the typography of common inline maths notation without altering its
 * meaning. Safe to run on any text; unmatched input passes through untouched.
 */
export function prettifyMath(input: string): string {
  if (!input) return input;
  let s = input;

  // Exponents limited to a sign and digits: x^19, 5^-14, x^{2}, x^(2).
  // A letter or parenthesised expression exponent (x^n, x^(a+b)) is left alone.
  s = s.replace(
    /\^\{([+-]?\d+)\}|\^\(([+-]?\d+)\)|\^([+-]?\d+)/g,
    (_m, braced, parened, bare) => toSuperscript(braced ?? parened ?? bare),
  );

  // sqrt(...) with no nested parentheses. A single atom drops the parentheses
  // (sqrt(14) -> √14); anything with operators keeps them (sqrt(x+1) -> √(x+1))
  // so the radical's scope stays unambiguous. The guard is a lookbehind for a
  // letter (not a word boundary) so a coefficient reads correctly too:
  // "3sqrt(45)" -> "3√45" (a \b would fail here, since 3 and s are both word
  // characters), while "resqrt" and other words are still left untouched.
  s = s.replace(/(?<![A-Za-z])sqrt\(([^()]+)\)/gi, (_m, inner: string) =>
    /^[\w.]+$/.test(inner) ? `√${inner}` : `√(${inner})`,
  );

  // Fractions are left exactly as the AI wrote them ("13/75"). Converting the
  // slash to U+2044 was inconsistent — it only fired for integer/integer, so an
  // answer mixing "13/75" and "4/24.8" rendered with two different slashes —
  // and the fraction-slash glyph itself is unreliable across fonts. A plain
  // slash is the AI's own notation and reads correctly everywhere.

  // Relational symbols. Text nodes only reach here, so code is never affected.
  s = s
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/\+\/-/g, "±");

  return s;
}
