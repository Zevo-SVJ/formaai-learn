import { en } from "@/i18n/en";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { OG_IMAGE, SITE_NAME, SOCIAL_DESCRIPTION } from "@/lib/seo";

/**
 * What Forma is, in the form a search engine can read.
 *
 * The site had no structured data at all, which leaves Google to infer the
 * organisation, the product and the answers to the questions on the page from
 * prose. Everything here is already on the landing in some form - none of it is
 * a claim made only to a crawler, which is the line that separates markup from
 * spam.
 *
 * Written in English deliberately. The served HTML is English whatever the
 * reader's language, because the locale is only known in the browser and
 * crawlers run no scripts, so describing the page in any other language would
 * describe a page Google never sees.
 *
 * One graph rather than several scripts: @id lets the nodes reference each
 * other, so the publisher of the site and the maker of the app are stated once
 * and are visibly the same entity.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

export function landingSchema() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      // The mark, not the social card. Google expects a logo it can show
      // beside the name, and a 1200x630 banner is not that.
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon-512.png"),
        width: 512,
        height: 512,
      },
      description: SOCIAL_DESCRIPTION,
      // A real page, not an invented address or phone number. Nothing here
      // claims a channel Forma does not actually answer on.
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: absoluteUrl("/contact"),
        availableLanguage: ["en", "fr", "es", "de", "pt", "it"],
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      publisher: { "@id": ORG_ID },
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: absoluteUrl("/"),
      name: en.seo.title,
      description: en.seo.description,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": APP_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
      inLanguage: "en",
    },
    {
      // The product itself. EducationalApplication is the category Google
      // understands for a study tool, and the free tier is stated because an
      // offer with a price of zero is what makes "free" a fact rather than
      // marketing.
      "@type": "SoftwareApplication",
      "@id": APP_ID,
      name: SITE_NAME,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      description: SOCIAL_DESCRIPTION,
      image: OG_IMAGE,
      publisher: { "@id": ORG_ID },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Explains a lesson from a photo, a PDF or a worksheet",
        "Turns a lesson into revision cards",
        "Generates quizzes at a chosen difficulty",
        "Tracks grades and progress over the term",
      ],
    },
    {
      // The questions and answers are the ones on the page, word for word.
      // Marking up answers a visitor cannot see is the one thing this type is
      // routinely abused for.
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      isPartOf: { "@id": SITE_ID },
      // Ties the questions to the page they are actually printed on, which is
      // what lets Google check the markup against what a visitor sees.
      mainEntityOfPage: { "@id": `${SITE_URL}/#webpage` },
      inLanguage: "en",
      mainEntity: en.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return { "@context": "https://schema.org", "@graph": graph };
}
