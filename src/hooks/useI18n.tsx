import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { Dict } from "@/i18n/en";
import { getLocale, setLocale, type Locale } from "@/i18n";
import "@/i18n";

/**
 * Typed wrapper around i18next.
 * Use `t(k => k.hero.title1)` for a typesafe path,
 * or `raw(k => k.reviews.items)` when you need the underlying array/object.
 */
export function useI18n() {
  const { t: rawT, i18n } = useTranslation();

  function path<T>(selector: (d: Dict) => T): string {
    const proxy = new Proxy(
      {},
      {
        get(_t, key: string) {
          const stack: string[] = [];
          const build = (k: string): unknown => {
            stack.push(k);
            return new Proxy(
              {},
              {
                get: (_x, kk: string) => build(kk),
              },
            );
          };
          const inner = build(key);
          void inner;
          return build(key);
        },
      },
    );
    void proxy;
    // simpler: use the actual dictionary to record the path
    const trace: string[] = [];
    const track = (): unknown =>
      new Proxy(function () {}, {
        get(_t, prop: string) {
          if (prop === "toString" || prop === "valueOf" || typeof prop === "symbol") return () => "";
          trace.push(prop);
          return track();
        },
      });
    selector(track() as Dict);
    return trace.join(".");
  }

  function t<T = string>(selector: (d: Dict) => T, vars?: Record<string, string | number>): string {
    const key = path(selector);
    const out = rawT(key, vars ?? {});
    return typeof out === "string" ? out : String(out);
  }

  function raw<T>(selector: (d: Dict) => T): T {
    const key = path(selector);
    return rawT(key, { returnObjects: true }) as unknown as T;
  }

  return { t, raw, locale: (i18n.language as Locale) || "en" };
}

export function useLocaleToggle() {
  const [locale, setLoc] = useState<Locale>(() => (getLocale() as Locale) || "en");
  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);
  return {
    locale,
    change: (l: Locale) => {
      setLocale(l);
      setLoc(l);
    },
  };
}
