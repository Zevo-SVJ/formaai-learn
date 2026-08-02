import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { HeroActions } from "@/components/HeroActions";
import { LessonToCards } from "@/components/LessonToCards";
import { ScanToUnderstanding } from "@/components/ScanToUnderstanding";
import { GradeToCurve } from "@/components/GradeToCurve";
import { TheChain } from "@/components/TheChain";
import { SubjectCarousels } from "@/components/SubjectCarousels";
import { SocialProof } from "@/components/SocialProof";
import { CompareSection } from "@/components/CompareSection";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";

import { SiteFooter } from "@/components/SiteFooter";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { absoluteUrl } from "@/lib/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma AI — AI Study Assistant for Students" },
      {
        name: "description",
        content:
          "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step solutions, and smarter study tools.",
      },
      { property: "og:title", content: "Forma AI — AI Study Assistant for Students" },
      {
        property: "og:description",
        content:
          "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step solutions, and smarter study tools.",
      },
      { property: "og:type", content: "website" },
      // og:url tells crawlers and social platforms which address is the real
      // one, so shares from a preview host still resolve to production.
      { property: "og:url", content: absoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <CompareSection />
      {/* Grades come after the comparison: the visitor has to want Forma before
          being told it also follows the term. */}
      <GradeToCurve />
      <MidCTA />
      <ReviewsSection />
      <FAQSection />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={[
        "safe-top sticky top-0 z-30 border-b transition-colors",
        scrolled
          ? "border-border/60 bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/">
          <Logo />
        </Link>
        {/* Smooth is asked for here rather than left on `html`: there it also
            governed the router's jump between pages, which made every new
            section glide up from the last one's scroll position. */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <AnchorLink id="how">{t((d) => d.nav.how)}</AnchorLink>
          <AnchorLink id="reviews">{t((d) => d.nav.reviews)}</AnchorLink>
          <AnchorLink id="faq">{t((d) => d.nav.faq)}</AnchorLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:border-border-strong"
          >
            {t((d) => d.common.signIn)}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden px-5 pt-8 pb-10 sm:pt-16 sm:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, oklch(0.94 0.05 155 / 0.55) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[70%] h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "oklch(0.92 0.06 60 / 0.6)" }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mb-6 flex justify-center">
          <SocialProof />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE.out }}
          className="text-[38px] font-bold leading-[1.03] tracking-[-0.04em] text-foreground sm:text-6xl"
        >
          {t((d) => d.hero.title1)}
          <br />
          <span className="text-muted-foreground">{t((d) => d.hero.title2)}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE.out }}
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg"
        >
          {t((d) => d.hero.subtitle)}
        </motion.p>

        {/* The claim, demonstrated before it is argued: a lesson going from
            unreadable to understood, above the fold, with no scroll and no
            text required. It sits between the promise and the button, which is
            where a visitor decides whether the promise is worth anything. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: EASE.out }}
          className="mt-9"
        >
          <ScanToUnderstanding />
        </motion.div>

        <div className="mt-9">
          <HeroActions />
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{t((d) => d.hero.ctaHint)}</p>
      </div>

      {/* Subject carousel sits directly under the hero buttons, edge to edge. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE.out }}
        className="relative -mx-5 mt-12 sm:mt-16"
      >
        <SubjectCarousels />
      </motion.div>
    </section>
  );
}

// Middle CTA: once the value is clear (after the comparison), invite the visitor
// to start — and quietly widen the story from "explain courses" to "your
// learning companion that also tracks your grades and progress".
function MidCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t((d) => d.hero.midTitle)}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {t((d) => d.hero.midBody)}
        </p>
        <div className="mt-8">
          <HeroActions secondary={false} />
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{t((d) => d.hero.ctaHint)}</p>
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
  id,
  bg,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  id?: string;
  bg?: "surface" | "default";
}) {
  return (
    <section
      id={id}
      className={["px-5 py-20 sm:py-28", bg === "surface" ? "bg-surface-muted/50" : ""].join(" ")}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="mt-14">{children}</div>}
      </div>
    </section>
  );
}

function Problem() {
  const { t } = useI18n();
  return (
    <Section
      eyebrow={t((d) => d.problem.eyebrow)}
      title={t((d) => d.problem.title)}
      subtitle={t((d) => d.problem.subtitle)}
    >
      <TheChain />
    </Section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="how" className="px-5 pt-20 sm:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
          {t((d) => d.how.eyebrow)}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t((d) => d.how.title)}
        </h2>
      </div>
      <div className="-mx-5">
        <LessonToCards />
      </div>
    </section>
  );
}

function ReviewsSection() {
  const { t } = useI18n();
  return (
    <section id="reviews" className="px-0 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
          {t((d) => d.reviews.eyebrow)}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t((d) => d.reviews.title)}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
          {t((d) => d.reviews.subtitle)}
        </p>
      </div>
      <div className="mt-12">
        <ReviewsMarquee />
      </div>
    </section>
  );
}

function FAQSection() {
  const { t, raw } = useI18n();
  const items = raw((d) => d.faq.items);
  return (
    <Section id="faq" eyebrow={t((d) => d.faq.eyebrow)} title={t((d) => d.faq.title)} bg="surface">
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border-border">
              <AccordionTrigger className="text-left text-[16px] font-semibold hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 pb-24 pt-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-foreground p-10 text-center text-background sm:p-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {t((d) => d.finalCta.title)}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-background/70">
          {t((d) => d.finalCta.subtitle)}
        </p>
        <div className="mt-8">
          <HeroActions secondary={false} />
        </div>
        {/* La gratuité est le levier le plus fort sur ce public, et elle
            n'apparaissait qu'une fois, en 12 px sous le hero. Elle est
            désormais rappelée à chaque moment de décision. */}
        <p className="mt-3 text-[12px] text-background/60">{t((d) => d.hero.ctaHint)}</p>
      </div>
    </section>
  );
}

/** An in-page link that glides, while navigation between pages does not. */
function AnchorLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${id}`}
      className="hover:text-foreground"
      onClick={(e) => {
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
