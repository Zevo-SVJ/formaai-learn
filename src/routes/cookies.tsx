import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/hooks/useI18n";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Forma AI" },
      { name: "description", content: "How Forma AI uses cookies." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t((d) => d.common.back)}
        </Link>
        <Logo />
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t((d) => d.legal.cookies.title)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t((d) => d.legal.cookies.updated)}</p>
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
          {t((d) => d.legal.cookies.placeholder)}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
