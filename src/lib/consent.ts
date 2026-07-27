// Analytics consent, stored on the device.
//
// GA4 writes cookies that are not strictly necessary, so under GDPR nothing may
// load or send before the student has actively agreed. Forma's own cookie policy
// promises exactly that ("if that ever changes, we will ask for your agreement
// first"), so this is what keeps the published policy true.
//
// Three states: "granted", "denied", and null when nothing has been chosen yet.
// Analytics only ever runs on "granted".

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "forma:analyticsConsent";

type Listener = (choice: ConsentChoice | null) => void;
const listeners = new Set<Listener>();

/** The stored choice, or null when the student has not answered yet. */
export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Storage blocked (Android Chrome with site data off). Treat as "not
    // answered": we simply never load analytics, which is the safe direction.
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // The choice will not survive a reload, but it must still apply right now.
  }
  if (choice === "denied") clearAnalyticsCookies();
  listeners.forEach((l) => l(choice));
}

/**
 * Removes the cookies GA4 wrote (_ga, _ga_<id>). Saying no has to actually
 * take the data off the device, otherwise withdrawing consent would only stop
 * future collection while leaving the existing identifier in place.
 */
function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  try {
    const names = document.cookie
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter((n) => n === "_ga" || n.startsWith("_ga_") || n.startsWith("_gid"));
    // The cookie is set on the registrable domain, so expire it on each
    // candidate scope: exact host, and the parent domain with a leading dot.
    const host = window.location.hostname;
    const scopes = [undefined, host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
    for (const name of names) {
      for (const domain of scopes) {
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
          (domain ? `; domain=${domain}` : "");
      }
    }
  } catch {
    // Best effort: never let cookie cleanup throw into the UI.
  }
}

/** Notifies when the choice changes, so the banner and analytics stay in sync. */
export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
