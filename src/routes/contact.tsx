import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft, Mail, Send, CheckCircle2 } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Forma AI" },
      { name: "description", content: "Get in touch with the Forma AI team." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<"general" | "problem" | "idea">("general");

  return (
    <div className="min-h-dvh bg-background">
      <header className="safe-top sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        {/* Back means back, not "to the landing page". Someone who came here
            from inside the app to report a bug — and who may have stepped out
            to their mail app in between — has to return to the screen they
            were on. Only a visitor who arrived here cold gets sent to the
            landing page. */}
        <button
          onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: "/" }))}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {t((d) => d.common.back)}
        </button>

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE.out }}
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
          transition={{ duration: 0.4, delay: 0.1, ease: EASE.out }}
          onSubmit={(e) => {
            e.preventDefault();
            // This form used to flip straight to "message sent" without sending
            // anything, so every bug report a student wrote was discarded. There
            // is no mail backend, so the message is handed to the user's own mail
            // client: it actually reaches us and needs no server.
            const to = t((d) => d.legal.contact.email);
            // The kind travels in the subject so feedback can be triaged at a
            // glance without any backend.
            const subject = `Forma — ${t((d) => d.legal.contact.form.kinds[kind])}`;
            const body = `${message}\n\n---\n${name}\n${email}`;
            track("feedback_opened", { kind });
            window.location.href =
              `mailto:${to}?subject=${encodeURIComponent(subject)}` +
              `&body=${encodeURIComponent(body)}`;
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
              {/* Three quiet chips, so a tester's message arrives already
                  sorted. Optional: "general" is the default. */}
              <div className="flex flex-wrap gap-2 pb-1">
                {(["general", "problem", "idea"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={[
                      "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition",
                      kind === k
                        ? "border-emerald bg-emerald text-white"
                        : "border-border bg-surface text-foreground hover:border-border-strong",
                    ].join(" ")}
                  >
                    {t((d) => d.legal.contact.form.kinds[k])}
                  </button>
                ))}
              </div>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t((d) => d.legal.contact.form.name)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t((d) => d.legal.contact.form.email)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
