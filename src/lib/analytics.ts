// Minimal GA4 wrapper.
//
// Deliberately inert until VITE_GA_MEASUREMENT_ID is set. With no id nothing is
// loaded, no cookie is written and no request leaves the browser, which is what
// keeps the current cookie policy ("no analytics, no trackers") truthful.
//
// BEFORE ENABLING: GA4 sets cookies that are not strictly necessary, so turning
// this on means updating legal.cookies and legal.privacy in every dictionary
// and asking for consent first — the cookie policy currently promises exactly
// that. See docs/ANALYTICS.md.
//
// The event list is intentionally short. It answers three questions and nothing
// else: do visitors activate, where do they stop, which features get used.

const MEASUREMENT_ID: string | undefined = (() => {
  try {
    const v = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
})();

/** The only events Forma reports. Adding one is a deliberate decision. */
export type AnalyticsEvent =
  // Activation funnel, in order.
  | "onboarding_started"
  | "onboarding_completed"
  | "account_created"
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

export function analyticsEnabled(): boolean {
  return !!MEASUREMENT_ID && typeof window !== "undefined";
}

let loaded = false;

/**
 * Loads gtag.js once, after the app is interactive. Called from the root; safe
 * to call repeatedly. Does nothing when no measurement id is configured.
 */
export function initAnalytics(): void {
  if (!analyticsEnabled() || loaded) return;
  loaded = true;
  try {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    const gtag: (...args: unknown[]) => void = (...args) => {
      window.dataLayer?.push(args);
    };
    window.gtag = gtag;
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

/** Reports one of the known events. No-ops when analytics is off. */
export function track(event: AnalyticsEvent, params?: Params): void {
  if (!analyticsEnabled()) return;
  try {
    window.gtag?.("event", event, params ?? {});
  } catch {
    // Same rule: a reporting failure is never a user-visible failure.
  }
}
