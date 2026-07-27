/**
 * Parses a plain-text AI answer into structured sections we can render
 * with proper visual hierarchy. No markdown, no bold syntax.
 *
 * Expected model output (English, French, Spanish, German, Portuguese or
 * Italian), section headers on their own line:
 *   Answer / Réponse
 *   Explanation / Explication
 *   Method / Méthode
 *   Common mistakes / Erreurs fréquentes
 *   Additional details / Pour aller plus loin
 *
 * MCQ items like "A) ..." "B = ..." "1) ..." are detected inside "Answer" and
 * rendered as clean key/value rows.
 */

import { sectionTitle } from "./answer-sections";

export type AnswerSection = {
  key: "answer" | "explanation" | "method" | "commonMistakes" | "details";
  title: string;
  paragraphs: string[];
  choices?: Array<{ label: string; value: string }>;
};

export type ParsedAnswer = {
  sections: AnswerSection[];
  /** raw is returned when parsing found no structured sections at all */
  raw?: string;
};

const HEADER_PATTERNS: Array<{ key: AnswerSection["key"]; re: RegExp }> = [
  {
    key: "answer",
    re: /^(answer|réponse|reponse|respuesta|antwort|resposta|risposta)\s*[:.]?\s*$/i,
  },
  {
    key: "explanation",
    re: /^(explanation|explication|explicación|explicacion|erklärung|erklaerung|erklarung|explicação|explicacao|spiegazione)\s*[:.]?\s*$/i,
  },
  { key: "method", re: /^(method|méthode|methode|método|metodo)\s*[:.]?\s*$/i },
  {
    key: "commonMistakes",
    re: /^(common mistakes|erreurs fréquentes|erreurs frequentes|pièges|pieges|errores frecuentes|häufige fehler|haufige fehler|haeufige fehler|erros comuns|errori frequenti)\s*[:.]?\s*$/i,
  },
  {
    key: "details",
    re: /^(additional details|pour aller plus loin|détails|details|plus|para profundizar|zum weiterlernen|para aprofundar|per approfondire)\s*[:.]?\s*$/i,
  },
];

const CHOICE_RE = /^\s*([A-Ha-h1-9])\s*[).=:\-]\s*(.+)$/;

function stripStyleTokens(line: string): string {
  return line
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/^#+\s*/, "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .trim();
}

function detectHeader(line: string): AnswerSection["key"] | null {
  const clean = line.replace(/[*#>_`]/g, "").trim();
  for (const { key, re } of HEADER_PATTERNS) if (re.test(clean)) return key;
  return null;
}

function pushParagraph(section: AnswerSection, buf: string[]) {
  const text = buf.map(stripStyleTokens).join(" ").replace(/\s+/g, " ").trim();
  if (text) section.paragraphs.push(text);
}

export function parseAnswer(text: string, locale: string = "en"): ParsedAnswer {
  const src = (text || "").replace(/\r\n/g, "\n").trim();
  if (!src) return { sections: [] };

  const lines = src.split("\n");
  const sections: AnswerSection[] = [];
  let current: AnswerSection | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) pushParagraph(current, buffer);
    buffer = [];
  };

  const titleOf = (k: AnswerSection["key"]) => sectionTitle(k, locale);

  const openSection = (key: AnswerSection["key"]) => {
    flush();
    current = { key, title: titleOf(key), paragraphs: [] };
    sections.push(current);
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    const header = detectHeader(line);
    if (header) {
      openSection(header);
      continue;
    }
    // Detect a choice row inside the current section (usually "answer")
    if (!current) {
      // No header seen yet, treat leading content as the "Answer" section.
      openSection("answer");
    }
    const active = current as unknown as AnswerSection;
    const m = CHOICE_RE.exec(line);
    if (m) {
      active.choices ??= [];
      active.choices.push({ label: m[1].toUpperCase(), value: stripStyleTokens(m[2]) });
      continue;
    }
    buffer.push(line);
  }
  flush();

  // Trim empty sections
  const filtered = sections.filter(
    (s) => s.paragraphs.length > 0 || (s.choices && s.choices.length > 0),
  );
  if (filtered.length === 0) return { sections: [], raw: src };
  return { sections: filtered };
}
