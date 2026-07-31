import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { listDocuments, toggleFavorite } from "@/lib/documents.functions";
import { relativeTime } from "@/lib/relative-time";
import { AppHeader } from "@/components/AppHeader";
import { EASE } from "@/lib/motion";
import { subjectIcon } from "@/lib/subject-icon";
import { useI18n } from "@/hooks/useI18n";
import { Loader2, Star, CheckCircle2, AlertCircle, ArrowRight, Home, Layers } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";

export const Route = createFileRoute("/_authenticated/library")({
  component: Library,
});

type Doc = {
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  chapter: string | null;
  status: string;
  favorite: boolean;
  created_at: string;
};

function Library() {
  const { t } = useI18n();
  const list = useServerFn(listDocuments);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const collections = useCollections();

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => list() as Promise<Doc[]>,
    refetchInterval: (q) => {
      const rows = (q.state.data as Doc[] | undefined) ?? [];
      return rows.some((r) => r.status !== "ready" && r.status !== "failed") ? 2500 : false;
    },
  });

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        back={
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-border-strong"
            aria-label={t((d) => d.common.home)}
          >
            <Home className="h-4 w-4" />
          </button>
        }
      />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-[38px]">
            {t((d) => d.common.library)}
          </h1>
          <p className="text-[15px] text-muted-foreground">{t((d) => d.libraryPage.subtitle)}</p>
        </div>

        {/* Kept lessons come first: they are the ones the student chose, so
            they should not be looked for underneath everything ever analysed.
            The shelf appears only once something is on it — an empty shelf
            above an empty library would just be two ways of saying nothing. */}
        {collections.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex flex-col gap-0.5">
              <h2 className="text-[19px] font-bold tracking-tight text-foreground">
                {t((d) => d.collections.title)}
              </h2>
              <p className="text-[13.5px] text-muted-foreground">
                {t((d) => d.collections.subtitle)}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {collections.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02, ease: EASE.out }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden rounded-3xl border border-emerald/25 bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-emerald/40"
                >
                  <Link
                    to="/collection/$id"
                    params={{ id: c.id }}
                    className="absolute inset-0"
                    aria-label={t((d2) => d2.collections.open)}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
                      <Layers className="h-5 w-5 text-emerald" strokeWidth={1.9} />
                    </div>
                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {c.cards.length === 1
                        ? t((d2) => d2.collections.oneCard)
                        : t((d2) => d2.collections.cards, { count: c.cards.length })}
                    </span>
                  </div>
                  <h3 className="relative mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
                    {c.title}
                  </h3>
                  <div className="relative mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                    {c.subject && <span>{c.subject}</span>}
                    {c.subject && c.level && <span>·</span>}
                    {c.level && <span>{c.level}</span>}
                  </div>
                  <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {relativeTime(c.savedAt, {
                        justNow: t((d2) => d2.common.justNow),
                        min: t((d2) => d2.common.minutesAgo),
                        h: t((d2) => d2.common.hoursAgo),
                        d: t((d2) => d2.common.daysAgo),
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {t((d2) => d2.common.continue)}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-14 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(data ?? []).map((d, i) => {
            const Icon = subjectIcon(d.subject);
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02, ease: EASE.out }}
                whileHover={{ y: -2 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-border-strong"
              >
                <Link
                  to="/doc/$docId"
                  params={{ docId: d.id }}
                  className="absolute inset-0"
                  aria-label={d.title}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
                    <Icon className="h-5 w-5 text-emerald" strokeWidth={1.9} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={d.status} />
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await fav({ data: { id: d.id, favorite: !d.favorite } });
                        qc.invalidateQueries({ queryKey: ["documents"] });
                      }}
                      className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface transition hover:border-border-strong"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          d.favorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <h3 className="relative mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
                  {d.title}
                </h3>
                <div className="relative mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  {d.subject && <span>{d.subject}</span>}
                  {d.subject && (d.level || d.chapter) && <span>·</span>}
                  {d.level && <span>{d.level}</span>}
                  {d.level && d.chapter && <span>·</span>}
                  {d.chapter && <span>{d.chapter}</span>}
                </div>
                <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {relativeTime(d.created_at, {
                      justNow: t((d2) => d2.common.justNow),
                      min: t((d2) => d2.common.minutesAgo),
                      h: t((d2) => d2.common.hoursAgo),
                      d: t((d2) => d2.common.daysAgo),
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {t((d2) => d2.common.continue)}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isLoading && (data ?? []).length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">{t((d) => d.libraryPage.empty)}</p>
            {/* Without a way out, an empty library is a dead end: uploading
                lives on Home, and nothing here says so. */}
            <Link
              to="/home"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13.5px] font-semibold text-background transition hover:opacity-90"
            >
              {t((d) => d.libraryPage.emptyCta)}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-emerald">
        <CheckCircle2 className="h-3 w-3" />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
        <AlertCircle className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
    </span>
  );
}
