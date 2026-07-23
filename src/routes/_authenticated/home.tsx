import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { listDocuments, toggleFavorite } from "@/lib/documents.functions";
import { relativeTime } from "@/lib/relative-time";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { UploadArea } from "@/components/UploadArea";
import { ReferralCard } from "@/components/ReferralCard";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import {
  BookOpen,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  component: Home,
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

function Home() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const list = useServerFn(listDocuments);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => list() as Promise<Doc[]>,
    refetchInterval: (q) => {
      const rows = (q.state.data as Doc[] | undefined) ?? [];
      return rows.some((r) => r.status !== "ready" && r.status !== "failed") ? 2500 : false;
    },
  });

  const [greetName, setGreetName] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data: u }) => {
        const name =
          (u.user?.user_metadata?.full_name as string | undefined) ||
          (u.user?.user_metadata?.name as string | undefined) ||
          (u.user?.email ? u.user.email.split("@")[0] : null);
        setGreetName(name);
      })
      // The greeting falls back to the anonymous wording; never break the page.
      .catch((e) => console.error("[home] could not read the profile name", e));
    // If user hasn't done onboarding, take them through it once.
    try {
      const done = window.localStorage.getItem("forma:onboarded");
      if (!done) navigate({ to: "/onboarding" });
    } catch {
      // ignore
    }
  }, [navigate]);

  const favorites = useMemo(() => (data ?? []).filter((d) => d.favorite).slice(0, 4), [data]);
  const recent = useMemo(() => (data ?? []).slice(0, 6), [data]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE.out }}
          className="mb-8 flex flex-col gap-1"
        >
          <h1 className="text-[30px] font-bold leading-tight tracking-tight text-foreground sm:text-[38px]">
            {greetName
              ? t((d) => d.home.greeting, { name: capitalize(greetName) })
              : t((d) => d.home.greetingAnon)}
          </h1>
          <p className="text-[15px] text-muted-foreground sm:text-[17px]">
            {t((d) => d.home.subhead)}
          </p>
        </motion.div>

        {/* Upload */}
        <div className="mb-10">
          <UploadArea />
        </div>

        {/* Referral — carries its own eyebrow and title. */}
        <ReferralCard />

        {/* Favorites */}
        <SectionTitle
          right={
            favorites.length > 0 ? (
              <Link
                to="/library"
                className="text-[13px] font-semibold text-emerald hover:underline"
              >
                {t((d) => d.home.seeAll)}
              </Link>
            ) : undefined
          }
        >
          {t((d) => d.home.favorites)}
        </SectionTitle>
        {favorites.length === 0 ? (
          <EmptyRow message={t((d) => d.home.favoritesEmpty)} tone="star" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {favorites.map((d, i) => (
              <DocCard
                key={d.id}
                doc={d}
                index={i}
                onFavToggle={async () => {
                  await fav({ data: { id: d.id, favorite: !d.favorite } });
                  qc.invalidateQueries({ queryKey: ["documents"] });
                }}
              />
            ))}
          </div>
        )}

        {/* Recent */}
        <SectionTitle
          right={
            (data ?? []).length > recent.length ? (
              <Link
                to="/library"
                className="text-[13px] font-semibold text-emerald hover:underline"
              >
                {t((d) => d.home.seeAll)}
              </Link>
            ) : undefined
          }
        >
          {t((d) => d.home.recent)}
        </SectionTitle>
        {isLoading ? (
          <div className="flex items-center justify-center py-14 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <EmptyRow message={t((d) => d.home.recentEmpty)} tone="book" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((d, i) => (
              <DocCard
                key={d.id}
                doc={d}
                index={i}
                onFavToggle={async () => {
                  await fav({ data: { id: d.id, favorite: !d.favorite } });
                  qc.invalidateQueries({ queryKey: ["documents"] });
                }}
              />
            ))}
          </div>
        )}

        {/* Encourage */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: EASE.out }}
          className="mt-14 flex flex-col gap-2 rounded-3xl border border-border bg-emerald-soft/50 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-foreground">
                {t((d) => d.home.encourage.title)}
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                {t((d) => d.home.encourage.body)}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-10 flex items-center justify-between first:mt-0">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </h2>
      {right}
    </div>
  );
}

function EmptyRow({ message, tone }: { message: string; tone: "star" | "book" }) {
  const Icon = tone === "star" ? Star : BookOpen;
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border bg-surface p-5 text-[14px] text-muted-foreground">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {message}
    </div>
  );
}

function DocCard({
  doc,
  index,
  onFavToggle,
}: {
  doc: Doc;
  index: number;
  onFavToggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: EASE.out }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-border-strong"
    >
      <Link
        to="/doc/$docId"
        params={{ docId: doc.id }}
        className="absolute inset-0"
        aria-label={doc.title}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
          <BookOpen className="h-5 w-5 text-emerald" />
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={doc.status} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavToggle();
            }}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface transition hover:border-border-strong"
            aria-label={doc.favorite ? t((d) => d.doc.favoriteRemove) : t((d) => d.doc.favoriteAdd)}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                doc.favorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
              }`}
            />
          </button>
        </div>
      </div>
      <h3 className="relative mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
        {doc.title}
      </h3>
      <div className="relative mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        {doc.subject && <span>{doc.subject}</span>}
        {doc.subject && (doc.level || doc.chapter) && <span>·</span>}
        {doc.level && <span>{doc.level}</span>}
        {doc.level && doc.chapter && <span>·</span>}
        {doc.chapter && <span>{doc.chapter}</span>}
      </div>
      <div className="relative mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {relativeTime(doc.created_at, {
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
    </motion.div>
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

