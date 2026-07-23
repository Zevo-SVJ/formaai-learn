import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { fr } from "./fr";

// Registry of supported locales. To add a language later the whole workflow is:
//   1. add its dictionary file (typed as Dict),
//   2. register it here,
// and automatic browser detection starts working for it. Nothing else changes.
export const LOCALES = { en, fr } as const;
export type Locale = keyof typeof LOCALES;
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";

const STORAGE_KEY = "forma:locale";

function isSupported(code: string | null | undefined): code is Locale {
  return !!code && (SUPPORTED_LOCALES as string[]).includes(code);
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  // This runs at module scope, so a throw here would stop the root route from
  // loading at all. Android Chrome with site data blocked throws on storage
  // access, so every access is guarded.

  // 1. A saved preference always wins.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch {
    // storage unavailable
  }

  // 2. First visit: detect from the browser. Match on the primary subtag so
  //    fr-FR / fr-CA → fr, en-US / en-GB → en. Check every preferred language
  //    in order; the first supported one wins.
  try {
    const candidates = [
      navigator.language,
      ...(navigator.languages ?? []),
    ].filter(Boolean);
    for (const tag of candidates) {
      const base = tag.toLowerCase().split("-")[0];
      if (isSupported(base)) return base;
    }
  } catch {
    // navigator unavailable
  }

  // 3. Unsupported (or undetectable) language falls back to English.
  return DEFAULT_LOCALE;
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: Object.fromEntries(
      SUPPORTED_LOCALES.map((code) => [code, { translation: LOCALES[code] }]),
    ),
    lng: detectInitialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: { escapeValue: false },
    returnNull: false,
    returnObjects: true,
  });
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // The preference will not survive a reload, but changing language must
      // never throw out into the error boundary.
    }
    document.documentElement.setAttribute("lang", locale);
  }
  i18n.changeLanguage(locale);
}

export function getLocale(): Locale {
  return (i18n.language as Locale) || DEFAULT_LOCALE;
}

export default i18n;
