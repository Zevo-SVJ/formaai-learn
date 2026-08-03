import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { isProductionHost } from "@/lib/site";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

/**
 * Keeps every address that is not production out of the index.
 *
 * A preview build is a complete second copy of the site: same pages, same
 * words, a different host. Crawled, it competes with production for the
 * queries production is meant to win, and it is the copy Google may decide to
 * show. The canonical tags already point home, which settles attribution, but
 * they are only a hint - this is not.
 *
 * A header rather than a meta tag, because it covers what a meta tag cannot:
 * the sitemap, the manifest, the images, every JSON response. Production is
 * untouched - the header is only ever added when the host is not the one Google
 * has been told about.
 */
const previewNoIndex = createMiddleware().server(async ({ next }) => {
  const result = await next();
  try {
    const host = getRequest()?.headers.get("host");
    if (!isProductionHost(host)) {
      result.response?.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
  } catch {
    // Nothing about serving the page depends on this succeeding.
  }
  return result;
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, previewNoIndex],
}));
