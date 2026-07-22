import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { fr } from "./fr";

export type Locale = "en" | "fr";

const STORAGE_KEY = "forma:locale";

export const DEFAULT_LOCALE: Locale = "en";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  // This runs at module scope, so a throw here stops the root route from
  // loading at all and the app boots straight into the error boundary.
  // Android Chrome with site data blocked throws SecurityError on read.
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable; fall through to the default.
  }
  if (stored === "en" || stored === "fr") return stored;
  // No stored preference: English is the default. (Browser language is
  // intentionally ignored so the default is predictable and English-first.)
  return DEFAULT_LOCALE;
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      lng: detectInitialLocale(),
      fallbackLng: "en",
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
      // The preference will not survive a reload, but switching language
      // must not throw out of the click handler into the error boundary.
    }
    document.documentElement.setAttribute("lang", locale);
  }
  i18n.changeLanguage(locale);
}

export function getLocale(): Locale {
  return (i18n.language as Locale) || "en";
}

export default i18n;
