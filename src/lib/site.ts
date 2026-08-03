// The one place the production origin is declared.
//
// Canonical URLs, og:url and the sitemap all have to agree on a single absolute
// origin, otherwise Google sees several versions of the same page. If Forma
// moves to a custom domain, change this value (or set VITE_SITE_URL) and every
// one of those follows.
const FALLBACK_ORIGIN = "https://getforma-ai.lovable.app";

function readEnvOrigin(): string | null {
  try {
    const v = import.meta.env?.VITE_SITE_URL;
    return typeof v === "string" && v.startsWith("http") ? v : null;
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
