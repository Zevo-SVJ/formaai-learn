// Minimal GA4 wrapper.
//
// Two independent conditions must hold before anything loads:
//   1. a measurement id is configured, and
//   2. the student has actively granted analytics consent (src/lib/consent.ts).
//
// Until both are true, gtag.js is never requested, no cookie is written and no
// request leaves the browser. Consent is checked at load time AND on every
// event, so a later "denied" takes effect immediately.
//
// The event list is intentionally short. It answers three questions and nothing
// else: do visitors activate, where do they stop, which features get used.

import { getConsent } from "./consent";

// The property id. Overridable per environment; the default is Forma's own
// GA4 property so a deploy needs no extra configuration.
const DEFAULT_MEASUREMENT_ID = "G-K96ZD0VD5S";

const MEASUREMENT_ID: string | undefined = (() => {
  try {
    const v = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    if (typeof v === "string" && v.trim()) return v.trim();
  } catch {
    // fall through to the default
  }
  return DEFAULT_MEASUREMENT_ID;
})();

/** The only events Forma reports. Adding one is a deliberate decision. */
export type AnalyticsEvent =
  // Activation funnel, in order.
  | "onboarding_started"
  | "onboarding_completed"
  | "account_created"
  | "upload_started"
  | "lesson_uploaded"
  | "analysis_completed"
  | "analysis_failed"
  // Feature usage.
  | "tutor_opened"
  | "tutor_message_sent"
  | "grade_added"
  | "feedback_opened";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** True only when an id exists AND the student granted consent. */
export function analyticsEnabled(): boolean {
  return !!MEASUREMENT_ID && typeof window !== "undefined" && getConsent() === "granted";
}

let loaded = false;

/**
 * Loads gtag.js once, after the app is interactive. Safe to call repeatedly:
 * it is a no-op without consent, and the consent banner calls it again the
 * moment the student accepts.
 */
export function initAnalytics(): void {
  if (!analyticsEnabled() || loaded) return;
  loaded = true;
  try {
    window.dataLayer = window.dataLayer || [];
    // This must push the `arguments` object, exactly like Google's own snippet.
    // gtag.js parses the command queue expecting arguments-like entries; an
    // ordinary array is pushed but never recognised as a command, so "config"
    // and "event" silently do nothing and no hit is ever sent.
    const gtag: (...args: unknown[]) => void = function () {
      // eslint-disable-next-line prefer-rest-params -- see comment above
      window.dataLayer?.push(arguments);
    };
    window.gtag = gtag;

    // Consent Mode: state the granted signals explicitly. Everything Forma does
    // not need stays denied, so no advertising or personalisation data is ever
    // collected, only anonymous audience measurement.
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);

    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, {
      // Never record the full URL: document ids and referral codes travel in
      // paths, and none of that belongs in an analytics account.
      anonymize_ip: true,
      send_page_view: true,
    });
  } catch {
    // Analytics must never take the app down.
  }
}

/** Reports one of the known events. No-ops without an id or without consent. */
export function track(event: AnalyticsEvent, params?: Params): void {
  if (!analyticsEnabled()) return;
  try {
    window.gtag?.("event", event, params ?? {});
  } catch {
    // Same rule: a reporting failure is never a user-visible failure.
  }
}
