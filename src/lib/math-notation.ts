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
  // so the radical's scope stays unambiguous.
  s = s.replace(/\bsqrt\(([^()]+)\)/gi, (_m, inner: string) =>
    /^[\w.]+$/.test(inner) ? `√${inner}` : `√(${inner})`,
  );

  // Numeric fractions to a fraction slash, which preserves the exact value and
  // just reads as a fraction. Guarded so dates (12/25/2024), ratios and
  // decimals (3.5/2, 13/4.5) are never touched, while a fraction followed by
  // ordinary punctuation (13/4.) still converts.
  s = s.replace(/(?<![\d/.])(\d{1,3})\/(\d{1,3})(?![\d/])(?!\.\d)/g, "$1⁄$2");

  // Relational symbols. Text nodes only reach here, so code is never affected.
  s = s
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/\+\/-/g, "±");

  return s;
}
