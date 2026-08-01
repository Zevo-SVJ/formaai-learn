import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { listDocuments, toggleFavorite } from "@/lib/documents.functions";
import { relativeTime } from "@/lib/relative-time";
import { AppHeader } from "@/components/AppHeader";
import { EASE } from "@/lib/motion";
import { subjectIcon } from "@/lib/subject-icon";
import { useI18n } from "@/hooks/useI18n";
import {
  Loader2,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers,
  Bookmark,
} from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { listAnalyses, listLooseCards, removeCard, type LooseCard } from "@/lib/collections";
import { CardDetail, type DetailCard } from "@/components/CardDetail";
import { sectionIcon } from "@/components/AnalysisCards";

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

type Tab = "analyses" | "cards";

function Library() {
  const { t } = useI18n();
  const list = useServerFn(listDocuments);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();
  const collections = useCollections();
  const [tab, setTab] = useState<Tab>("analyses");
  const [openCard, setOpenCard] = useState<LooseCard | null>(null);

  const analyses = listAnalyses(collections);
  const cards = listLooseCards(collections);

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => list() as Promise<Doc[]>,
    refetchInterval: (q) => {
      const rows = (q.state.data as Doc[] | undefined) ?? [];
      return rows.some((r) => r.status !== "ready" && r.status !== "failed") ? 2500 : false;
    },
  });

  const detail: DetailCard | null = openCard
    ? { ...openCard, icon: sectionIcon(openCard.key) }
    : null;

  return (
    <div className="min-h-dvh bg-background">
      {/* No back button: the library is a place the nav goes to, not a detour
          off somewhere else, and the nav is already in this header. */}
      <AppHeader />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-[38px]">
            {t((d) => d.common.library)}
          </h1>
          <p className="text-[15px] text-muted-foreground">{t((d) => d.libraryPage.subtitle)}</p>
        </div>

        {/* Two shelves, and the choice between them made before anything else:
            whole lessons on one side, single cards on the other. */}
        <Segmented
          tab={tab}
          onChange={setTab}
          labels={{
            analyses: t((d) => d.collections.title),
            cards: t((d) => d.collections.tabCards),
          }}
          counts={{ analyses: analyses.length, cards: cards.length }}
        />

        {tab === "analyses" ? (
          <div className="mt-7">
            {analyses.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {analyses.map((c, i) => (
                  <Tile key={c.id} index={i} accent>
                    <Link
                      to="/collection/$id"
                      params={{ id: c.id }}
                      className="absolute inset-0"
                      aria-label={t((d) => d.collections.open)}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <Badge>
                        <Layers className="h-5 w-5 text-emerald" strokeWidth={1.9} />
                      </Badge>
                      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {c.cards.length === 1
                          ? t((d) => d.collections.oneCard)
                          : t((d) => d.collections.cards, { count: c.cards.length })}
                      </span>
                    </div>
                    <h3 className="relative mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
                      {c.title}
                    </h3>
                    <Meta parts={[c.subject, c.level]} />
                    <Footer when={c.savedAt} />
                  </Tile>
                ))}
              </div>
            ) : (
              <Empty
                message={t((d) => d.collections.empty)}
                cta={t((d) => d.collections.emptyCta)}
              />
            )}

            {/* Everything ever analysed, kept reachable underneath. Saving is a
                choice; not having made it yet should not hide a lesson. */}
            <h2 className="mb-4 mt-10 text-[15px] font-bold tracking-tight text-foreground">
              {t((d) => d.collections.allAnalyses)}
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (data ?? []).length === 0 ? (
              <Empty
                message={t((d) => d.libraryPage.empty)}
                cta={t((d) => d.libraryPage.emptyCta)}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(data ?? []).map((d, i) => {
                  const Icon = subjectIcon(d.subject);
                  return (
                    <Tile key={d.id} index={i}>
                      <Link
                        to="/doc/$docId"
                        params={{ docId: d.id }}
                        className="absolute inset-0"
                        aria-label={d.title}
                      />
                      <div className="relative flex items-start justify-between gap-3">
                        <Badge>
                          <Icon className="h-5 w-5 text-emerald" strokeWidth={1.9} />
                        </Badge>
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
                                d.favorite
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <h3 className="relative mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
                        {d.title}
                      </h3>
                      <Meta parts={[d.subject, d.level, d.chapter]} />
                      <Footer when={d.created_at} />
                    </Tile>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-7">
            {cards.length === 0 ? (
              <Empty message={t((d) => d.collections.cardsEmpty)} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cards.map((card, i) => {
                  const Icon = sectionIcon(card.key);
                  return (
                    <Tile key={`${card.collectionId}:${card.key}`} index={i} accent>
                      <button
                        onClick={() => setOpenCard(card)}
                        className="absolute inset-0"
                        aria-label={card.title}
                      />
                      <div className="relative flex items-start justify-between gap-3">
                        <Badge>
                          <Icon className="h-5 w-5 text-emerald" />
                        </Badge>
                        <Bookmark className="h-4 w-4 text-emerald" />
                      </div>
                      <h3 className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {card.title}
                      </h3>
                      <p className="relative mt-1.5 line-clamp-3 text-[14.5px] leading-relaxed text-foreground">
                        {card.text}
                      </p>
                      <div className="relative mt-3 truncate text-[11px] text-muted-foreground">
                        {card.collectionTitle}
                      </div>
                    </Tile>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* A kept card opens on its own, in the same reader the deck uses. */}
      <CardDetail
        card={detail}
        saved
        onSave={() => {
          if (!openCard) return;
          removeCard(openCard.collectionId, openCard.key);
          setOpenCard(null);
        }}
        onClose={() => setOpenCard(null)}
      />
    </div>
  );
}

/** iOS-style segmented control: the choice, made once, before any content. */
function Segmented({
  tab,
  onChange,
  labels,
  counts,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  labels: Record<Tab, string>;
  counts: Record<Tab, number>;
}) {
  const tabs: Tab[] = ["analyses", "cards"];
  return (
    <div
      role="tablist"
      className="flex w-full gap-1 rounded-2xl border border-border bg-surface-muted p-1"
    >
      {tabs.map((key) => {
        const active = tab === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className="relative flex-1 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors"
          >
            {/* The moving pill, not two swapped backgrounds: the selection
                slides between the halves the way iOS does. */}
            {active && (
              <motion.span
                layoutId="library-tab"
                transition={{ type: "spring", damping: 30, stiffness: 380 }}
                className="absolute inset-0 rounded-xl bg-card shadow-[var(--shadow-soft)]"
              />
            )}
            <span
              className={`relative flex items-center justify-center gap-1.5 ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {labels[key]}
              {counts[key] > 0 && (
                <span className="text-[11.5px] font-bold text-muted-foreground">{counts[key]}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Tile({
  children,
  index,
  accent = false,
}: {
  children: React.ReactNode;
  index: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.02, ease: EASE.out }}
      whileHover={{ y: -2 }}
      className={[
        "group relative overflow-hidden rounded-3xl border bg-card p-5 shadow-[var(--shadow-soft)] transition-colors",
        accent
          ? "border-emerald/25 hover:border-emerald/40"
          : "border-border hover:border-border-strong",
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
      {children}
    </div>
  );
}

function Meta({ parts }: { parts: (string | null)[] }) {
  const kept = parts.filter(Boolean) as string[];
  if (kept.length === 0) return null;
  return (
    <div className="relative mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
      {kept.map((p, i) => (
        <span key={p + i}>
          {i > 0 && <span className="mr-1.5">·</span>}
          {p}
        </span>
      ))}
    </div>
  );
}

function Footer({ when }: { when: string }) {
  const { t } = useI18n();
  return (
    <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
      <span>
        {relativeTime(when, {
          justNow: t((d) => d.common.justNow),
          min: t((d) => d.common.minutesAgo),
          h: t((d) => d.common.hoursAgo),
          d: t((d) => d.common.daysAgo),
        })}
      </span>
      <span className="inline-flex items-center gap-1 font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
        {t((d) => d.common.continue)}
        <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}

function Empty({ message, cta }: { message: string; cta?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {/* Without a way out, an empty shelf is a dead end: uploading lives on
          Home, and nothing here says so. */}
      {cta && (
        <Link
          to="/home"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13.5px] font-semibold text-background transition hover:opacity-90"
        >
          {cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
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
