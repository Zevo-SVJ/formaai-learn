import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt, served rather than shipped as a static file.
 *
 * It was in public/, which meant the production origin was written down in two
 * places: once in site.ts, where canonical URLs, og:url and the sitemap read
 * it, and once by hand here. They agree today. On the day Forma moves to its
 * own domain they would not, and the one that lies is the one telling Google
 * where the sitemap lives.
 *
 * The sitemap route already does exactly this. Nothing new is invented.
 */

/** Signed-in surfaces and the doors to them. Nothing here is indexable, and
 *  crawling it only wastes the budget that should go to the public pages. */
const PRIVATE = ["/auth", "/library", "/doc/", "/onboarding"];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = [
          "User-agent: *",
          "Allow: /",
          ...PRIVATE.map((p) => `Disallow: ${p}`),
          "",
          `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
