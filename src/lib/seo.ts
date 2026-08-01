/**
 * Writes the site's title and description into the document head.
 *
 * The head TanStack renders is static, and the locale is only known in the
 * browser, so the served HTML always carries English. That is the right default
 * — every social crawler reads the raw HTML and runs no scripts, so English is
 * what a shared link will show whatever language the sharer uses. This applies
 * the active language afterwards, for Google's rendered pass and for the tab
 * title the student actually sees.
 *
 * Title and description are kept in step across the plain, Open Graph and
 * Twitter tags: a card that disagrees with the page it links to is worse than
 * no card.
 */

function upsert(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applySiteMeta({ title, description }: { title: string; description: string }) {
  if (typeof document === "undefined") return;
  document.title = title;
  upsert("name", "description", description);
  upsert("property", "og:title", title);
  upsert("property", "og:description", description);
  upsert("name", "twitter:title", title);
  upsert("name", "twitter:description", description);
}
