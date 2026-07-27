import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl, PUBLIC_ROUTES } from "@/lib/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // <loc> has to be an absolute URL: the sitemap protocol requires it and
        // Google discards entries that are not. This file used to emit a bare
        // "/", which made the whole sitemap useless.
        const lastmod = new Date().toISOString().slice(0, 10);
        const urls = PUBLIC_ROUTES.map((path) => {
          const priority = path === "/" ? "1.0" : "0.5";
          const changefreq = path === "/" ? "weekly" : "yearly";
          return `  <url><loc>${absoluteUrl(path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
        }).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
