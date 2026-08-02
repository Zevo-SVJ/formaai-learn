import { absoluteUrl } from "@/lib/site";

/**
 * The one place Forma's social identity is declared.
 *
 * Every route used to be free to restate og:title and og:description, and the
 * landing did - with strings identical to the root's. TanStack de-duplicates
 * the rendered tags, so nothing was visibly broken, but the copy lived in two
 * files and the route silently won. It lives here now, and the root is the only
 * thing that spreads it.
 */

export const SITE_NAME = "Forma AI";

/**
 * The social headline, which is deliberately not the `<title>`.
 *
 * A `<title>` is read by a search engine deciding what a page is about, so it
 * says "AI Study Assistant for Students" and carries the words people type. A
 * link preview is read by a person deciding whether to tap, so it gets the
 * promise instead. `og:site_name` puts the brand beside it either way, which is
 * what frees the headline from having to introduce Forma.
 */
export const SOCIAL_TITLE = "Understand every lesson. Not just the answer.";

/**
 * What Forma actually does, in the order a student meets it. No "AI-powered",
 * no "smarter study tools": every one of those words survives being deleted,
 * which is the test.
 */
export const SOCIAL_DESCRIPTION =
  "Upload a lesson, a worksheet or a photo of your notes. Forma explains it in words that make sense, then turns it into cards and quizzes to revise from.";

/** 1200x630, rendered from the landing's own type, colour and product UI. */
export const OG_IMAGE = absoluteUrl("/og.png");
export const OG_IMAGE_ALT =
  "Forma AI: understand every lesson, not just the answer. A phone showing a lesson turned into cards, a quiz and progress over time.";

/**
 * Everything a link preview needs, declared once.
 *
 * Sizes are stated because Facebook, LinkedIn and Slack lay the card out before
 * they have finished fetching the image: without them the first person to share
 * a link gets a small card, and it is cached that way.
 */
export function socialMeta() {
  return [
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    // The served HTML is English whatever the reader's language, because
    // crawlers run no scripts. Declaring alternates would promise localised
    // URLs that do not exist.
    { property: "og:locale", content: "en_US" },
    { property: "og:title", content: SOCIAL_TITLE },
    { property: "og:description", content: SOCIAL_DESCRIPTION },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:secure_url", content: OG_IMAGE },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: OG_IMAGE_ALT },

    // X and Slack read these rather than the Open Graph pair.
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SOCIAL_TITLE },
    { name: "twitter:description", content: SOCIAL_DESCRIPTION },
    { name: "twitter:image", content: OG_IMAGE },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}

/**
 * Applies the active language to the tab title and the meta description.
 *
 * Only those two. It used to rewrite og:title and og:description as well, which
 * achieved nothing: every social crawler reads the raw HTML and runs no
 * scripts, so no card has ever seen a value this function wrote. All it did was
 * leave the hydrated DOM disagreeing with what was served, and make the social
 * copy look like it lived in two places.
 */
export function applySiteMeta({ title, description }: { title: string; description: string }) {
  if (typeof document === "undefined") return;
  document.title = title;
  let el = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", description);
}
