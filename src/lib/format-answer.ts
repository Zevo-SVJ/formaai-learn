/**
 * Parses a plain-text AI answer into structured sections we can render
 * with proper visual hierarchy. No markdown, no bold syntax.
 *
 * Expected model output (English or French), section headers on their own line:
 *   Answer / Réponse
 *   Explanation / Explication
 *   Method / Méthode
 *   Common mistakes / Erreurs fréquentes
 *   Additional details / Pour aller plus loin
 *
 * MCQ items like "A) ..." "B = ..." "1) ..." are detected inside "Answer" and
 * rendered as clean key/value rows.
 */

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

const SECTION_TITLES: Record<AnswerSection["key"], { en: string; fr: string }> = {
  answer: { en: "Answer", fr: "Réponse" },
  explanation: { en: "Explanation", fr: "Explication" },
  method: { en: "Method", fr: "Méthode" },
  commonMistakes: { en: "Common mistakes", fr: "Erreurs fréquentes" },
  details: { en: "Additional details", fr: "Pour aller plus loin" },
};

const HEADER_PATTERNS: Array<{ key: AnswerSection["key"]; re: RegExp }> = [
  { key: "answer", re: /^(answer|réponse|reponse)\s*[:.]?\s*$/i },
  { key: "explanation", re: /^(explanation|explication)\s*[:.]?\s*$/i },
  { key: "method", re: /^(method|méthode|methode)\s*[:.]?\s*$/i },
  { key: "commonMistakes", re: /^(common mistakes|erreurs fréquentes|erreurs frequentes|pièges|pieges)\s*[:.]?\s*$/i },
  { key: "details", re: /^(additional details|pour aller plus loin|détails|details|plus)\s*[:.]?\s*$/i },
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

  const isFr = locale.startsWith("fr");
  const titleOf = (k: AnswerSection["key"]) => (isFr ? SECTION_TITLES[k].fr : SECTION_TITLES[k].en);

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
    const m = CHOICE_RE.exec(line);
    if (m && current) {
      current.choices ??= [];
      current.choices.push({ label: m[1].toUpperCase(), value: stripStyleTokens(m[2]) });
      continue;
    }
    if (!current) {
      // No header seen yet — treat leading content as the "Answer" section.
      openSection("answer");
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
