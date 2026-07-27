// Single source of truth for the section headers used in tutor answers.
//
// Two places depend on these strings and MUST agree, or answers render as one
// unstructured block: the chat prompt (src/routes/api/chat.ts) tells the model
// which headers to emit, and the parser (src/lib/format-answer.ts) detects
// them. Keeping both sides here means adding a language can never desync them.

export const SECTION_KEYS = [
  "answer",
  "explanation",
  "method",
  "commonMistakes",
  "details",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Header wording per locale, written the way a teacher in that language would. */
export const SECTION_TITLES: Record<SectionKey, Record<string, string>> = {
  answer: {
    en: "Answer",
    fr: "Réponse",
    es: "Respuesta",
    de: "Antwort",
    pt: "Resposta",
    it: "Risposta",
  },
  explanation: {
    en: "Explanation",
    fr: "Explication",
    es: "Explicación",
    de: "Erklärung",
    pt: "Explicação",
    it: "Spiegazione",
  },
  method: {
    en: "Method",
    fr: "Méthode",
    es: "Método",
    de: "Methode",
    pt: "Método",
    it: "Metodo",
  },
  commonMistakes: {
    en: "Common mistakes",
    fr: "Erreurs fréquentes",
    es: "Errores frecuentes",
    de: "Häufige Fehler",
    pt: "Erros comuns",
    it: "Errori frequenti",
  },
  details: {
    en: "Additional details",
    fr: "Pour aller plus loin",
    es: "Para profundizar",
    de: "Zum Weiterlernen",
    pt: "Para aprofundar",
    it: "Per approfondire",
  },
};

/** Language name injected into the prompt so the model answers in that language. */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
};

export function baseLocale(locale: string | undefined | null): string {
  return (locale || "en").toLowerCase().split("-")[0];
}

export function sectionTitle(key: SectionKey, locale: string): string {
  const base = baseLocale(locale);
  return SECTION_TITLES[key][base] ?? SECTION_TITLES[key].en;
}

/** The five headers, in order, for the given locale. */
export function sectionTitleList(locale: string): string[] {
  return SECTION_KEYS.map((k) => sectionTitle(k, locale));
}
