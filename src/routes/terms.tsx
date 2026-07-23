import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Forma AI" },
      { name: "description", content: "Terms of Service for Forma AI." },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { t, raw } = useI18n();
  const sections = raw((d) => d.legal.terms.sections);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t((d) => d.common.back)}
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {t((d) => d.legal.terms.title)}
        </motion.h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t((d) => d.legal.terms.updated)}
        </p>
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-4 text-[13px] text-muted-foreground">
          {t((d) => d.legal.terms.draft)}
        </div>
        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <h2 className="text-lg font-bold text-foreground">{s.h}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {s.p}
              </p>
            </motion.section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
