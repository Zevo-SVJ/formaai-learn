import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { fr } from "./fr";

export type Locale = "en" | "fr";

const STORAGE_KEY = "forma:locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  const nav = (window.navigator.language || "en").toLowerCase();
  return nav.startsWith("fr") ? "fr" : "en";
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
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.setAttribute("lang", locale);
  }
  i18n.changeLanguage(locale);
}

export function getLocale(): Locale {
  return (i18n.language as Locale) || "en";
}

export default i18n;
