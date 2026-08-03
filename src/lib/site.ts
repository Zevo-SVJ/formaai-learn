// The one place the production origin is declared.
//
// Canonical URLs, og:url, the sitemap, robots.txt, the JSON-LD graph and the
// social image all have to agree on a single absolute origin, or Google sees
// several versions of the same page.
//
// It is configuration, not code. Moving host - or buying a domain - is setting
// VITE_SITE_URL and rebuilding; nothing in src/ needs editing, which is the
// whole point of this file existing.
const FALLBACK_ORIGIN = "https://getforma-ai.vercel.app";

function readEnvOrigin(): string | null {
  try {
    // Set deliberately. This is the one to change for a custom domain, and it
    // beats everything below.
    const explicit = import.meta.env?.VITE_SITE_URL;
    if (typeof explicit === "string" && explicit.startsWith("http")) return explicit;

    // Vercel knows its own stable production domain and hands it to the build.
    // Reading it means a fresh deployment is correct before anybody has set a
    // variable, rather than silently canonicalising to the wrong host.
    const vercel = import.meta.env?.VITE_VERCEL_PROJECT_PRODUCTION_URL;
    if (typeof vercel === "string" && vercel.length > 0) {
      return vercel.startsWith("http") ? vercel : `https://${vercel}`;
    }

    return null;
  } catch {
    return null;
  }
}

/** Absolute production origin, no trailing slash. */
export const SITE_URL = (readEnvOrigin() ?? FALLBACK_ORIGIN).replace(/\/+$/, "");

/** Absolute URL for a path, for canonical tags and the sitemap. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  // Keep the root as a bare origin + "/" and everything else without a
  // trailing slash, so one page never has two canonical spellings.
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

/**
 * Is this request being served from the address Google knows about?
 *
 * Everything else - a preview build, a branch deployment, a tester link - is a
 * second copy of the same site. Left alone it would be crawlable, and a second
 * crawlable copy competes with production for the same queries. Anything that
 * is not the production host is treated as a preview, which is the safe way
 * round: a new preview host is protected the day it appears, without anybody
 * remembering to add it to a list.
 */
export function isProductionHost(host: string | null | undefined): boolean {
  if (!host) return false;
  try {
    const bare = host.split(":")[0].toLowerCase();
    return bare === new URL(SITE_URL).hostname.toLowerCase();
  } catch {
    return false;
  }
}

/** Every publicly indexable route. The sitemap is generated from this list. */
export const PUBLIC_ROUTES = ["/", "/terms", "/privacy", "/cookies", "/contact"] as const;
