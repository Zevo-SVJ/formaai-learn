import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft, Mail, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Forma AI" },
      { name: "description", content: "Get in touch with the Forma AI team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/">
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
          {t((d) => d.legal.contact.title)}
        </motion.h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {t((d) => d.legal.contact.subtitle)}
        </p>

        <a
          href={`mailto:${t((d) => d.legal.contact.email)}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:border-border-strong"
        >
          <Mail className="h-4 w-4 text-emerald" />
          {t((d) => d.legal.contact.email)}
        </a>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-10 space-y-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
        >
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-soft">
                <CheckCircle2 className="h-6 w-6 text-emerald" />
              </div>
              <p className="text-[15px] font-semibold text-foreground">
                {t((d) => d.legal.contact.form.sent)}
              </p>
            </div>
          ) : (
            <>
              <input
                required
                placeholder={t((d) => d.legal.contact.form.name)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <input
                type="email"
                required
                placeholder={t((d) => d.legal.contact.form.email)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <textarea
                required
                rows={5}
                placeholder={t((d) => d.legal.contact.form.message)}
                className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3 text-[15px] font-semibold text-background"
              >
                <Send className="h-4 w-4" />
                {t((d) => d.legal.contact.form.send)}
              </button>
            </>
          )}
        </motion.form>
      </main>

      <SiteFooter />
    </div>
  );
}
