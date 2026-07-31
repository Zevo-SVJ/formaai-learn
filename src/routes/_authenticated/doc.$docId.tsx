import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  getDocument,
  getSignedFileUrl,
  analyzeDocument,
  toggleFavorite,
} from "@/lib/documents.functions";
import { Logo } from "@/components/Logo";
import { AnalysisCeremony } from "@/components/AnalysisCeremony";
import { AnswersPanel } from "@/components/AnswersPanel";
import { RichAnswer } from "@/components/RichAnswer";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { classifyError } from "@/lib/error-message";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  GraduationCap,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Shapes,
  RefreshCw,
  Star,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { ExplanationDeck } from "@/components/ExplanationDeck";
import { DeckIntro } from "@/components/DeckIntro";
import { ScrollingCardBody } from "@/components/ScrollingCardBody";

export const Route = createFileRoute("/_authenticated/doc/$docId")({
  component: DocPage,
});

type Doc = {
  id: string;
  title: string;
  storage_path: string;
  mime: string;
  status: string;
  subject: string | null;
  level: string | null;
  chapter: string | null;
  concepts: string[] | null;
  extracted_text: string | null;
  favorite: boolean;
  explanation: {
    is_exercise?: boolean;
    answers?: Array<{ label: string; question: string; answer: string }>;
    explanation?: string;
    method?: string;
    why?: string;
    common_mistake?: string;
    example?: string;
    analogy?: string;
  } | null;
  error: string | null;
};

function DocPage() {
  const { docId } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const getDoc = useServerFn(getDocument);
  const signFile = useServerFn(getSignedFileUrl);
  const retry = useServerFn(analyzeDocument);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();

  const [stalled, setStalled] = useState(false);

  const { data: doc, refetch } = useQuery({
    queryKey: ["document", docId],
    queryFn: () => getDoc({ data: { id: docId } }) as Promise<Doc>,
    refetchInterval: (q) => {
      const d = q.state.data as Doc | undefined;
      if (stalled) return false;
      return d && d.status !== "ready" && d.status !== "failed" ? 2000 : false;
    },
  });

  // The upload ceremony only plays for a document that was still being
  // analyzed when we arrived. Opening a finished lesson goes straight to it.
  const [ceremonyDone, setCeremonyDone] = useState(false);
  const sawPending = useRef(false);
  const pending = !!doc && doc.status !== "ready" && doc.status !== "failed";
  useEffect(() => {
    if (pending) sawPending.current = true;
  }, [pending]);

  // If the worker is killed mid-analysis (a serverless timeout, an evicted
  // instance) nothing gets to mark the row, so it stays "analyzing" and this
  // page would poll every two seconds forever behind a ceremony that never
  // finishes. After a wait far longer than a real analysis, stop and offer the
  // retry instead of hanging.
  const STALL_MS = 120_000;
  useEffect(() => {
    if (!pending) {
      setStalled(false);
      return;
    }
    const id = window.setTimeout(() => setStalled(true), STALL_MS);
    return () => window.clearTimeout(id);
  }, [pending]);

  const showResults = !!doc && doc.status === "ready" && (!sawPending.current || ceremonyDone);

  // Report the outcome of an analysis once per document, so the funnel shows
  // how many uploads actually produce a usable result.
  const reportedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!doc || reportedRef.current === doc.id) return;
    if (doc.status === "ready") {
      reportedRef.current = doc.id;
      track("analysis_completed", { subject: doc.subject ?? "unknown" });
    } else if (doc.status === "failed") {
      reportedRef.current = doc.id;
      track("analysis_failed");
    }
  }, [doc]);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!doc?.storage_path) return;
    signFile({ data: { path: doc.storage_path } })
      .then(({ url }) => setFileUrl(url))
      .catch(() => setFileUrl(null));
  }, [doc?.storage_path, signFile]);

  const onFavToggle = async () => {
    if (!doc) return;
    const next = !doc.favorite;
    await fav({ data: { id: doc.id, favorite: next } });
    toast.success(next ? t((d) => d.doc.favoriteToast) : t((d) => d.doc.unfavoriteToast));
    qc.invalidateQueries({ queryKey: ["document", docId] });
    qc.invalidateQueries({ queryKey: ["documents"] });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate({ to: "/home" })}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-border-strong"
              aria-label={t((d) => d.common.back)}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold leading-tight text-foreground">
                {doc?.title ?? t((d) => d.common.loading)}
              </div>
              {doc && (doc.subject || doc.level) && (
                <div className="truncate text-[11px] text-muted-foreground">
                  {[doc.subject, doc.level, doc.chapter].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {doc?.status === "ready" && (
              <button
                onClick={onFavToggle}
                className={[
                  "hidden items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition sm:inline-flex",
                  doc.favorite
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Star className={`h-3.5 w-3.5 ${doc.favorite ? "fill-current" : ""}`} />
                {doc.favorite ? t((d) => d.doc.favoriteRemove) : t((d) => d.doc.favoriteAdd)}
              </button>
            )}
            <Link to="/home" className="hidden sm:block">
              <Logo />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {!doc && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {doc && (doc.status === "failed" || (pending && stalled)) && (
          <FailedView
            error={
              doc.status !== "failed"
                ? t((d) => d.doc.stalled)
                : doc.error === "FORMA_UNREADABLE" || !doc.error
                  ? t((d) => d.doc.unreadable)
                  : doc.error
            }
            onRetry={async () => {
              setStalled(false);
              try {
                await retry({ data: { documentId: doc.id } });
                refetch();
              } catch (e) {
                toast.error(t((d) => d.errors[classifyError(e)]));
              }
            }}
          />
        )}

        {doc && doc.status !== "failed" && !stalled && !showResults && (
          <AnalysisCeremony
            title={doc.title}
            mime={doc.mime}
            fileUrl={fileUrl}
            extractedText={doc.extracted_text}
            ready={doc.status === "ready"}
            onComplete={() => setCeremonyDone(true)}
          />
        )}

        {showResults && doc && (
          <div className="space-y-5">
            {doc.explanation?.answers && doc.explanation.answers.length > 0 && (
              <AnswersPanel answers={doc.explanation.answers} />
            )}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <DocumentViewer doc={doc} fileUrl={fileUrl} />
              <ExplanationPanel doc={doc} onFavToggle={onFavToggle} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DocumentViewer({ doc, fileUrl }: { doc: Doc; fileUrl: string | null }) {
  const isImage = doc.mime.startsWith("image/");
  const isPdf = doc.mime === "application/pdf";
  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)]">
      <div className="flex h-full items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
        {!fileUrl ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : isImage ? (
          <img src={fileUrl} alt={doc.title} className="max-h-full max-w-full object-contain" />
        ) : isPdf ? (
          <iframe src={fileUrl} title={doc.title} className="h-full w-full" />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap text-left text-[13px] leading-relaxed text-foreground">
              {doc.extracted_text ?? "No preview available"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One explanation card.
 *
 * Two shapes, same content and same markup order. By default it is as tall as
 * its text — the vertical stack from `sm` up. With `fill` it takes the height
 * of whatever frame it is given, pins its header, and lets only its text
 * scroll: that is what lets the deck keep every card exactly the same size no
 * matter how long the explanation is. The shadow is left off in `fill`, since
 * there the deck owns elevation and varies it by depth.
 */
function ExplanationCard({
  icon: Icon,
  title,
  children,
  tone = "default",
  fill = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "emerald" | "warn";
  fill?: boolean;
}) {
  const bg =
    tone === "emerald"
      ? "bg-emerald-soft"
      : tone === "warn"
        ? "bg-amber-500/10"
        : "bg-surface-muted";
  const color =
    tone === "emerald" ? "text-emerald" : tone === "warn" ? "text-amber-600" : "text-foreground";

  const header = (
    <div className={`flex items-center gap-2.5 ${fill ? "mb-3 shrink-0" : "mb-3"}`}>
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
    </div>
  );

  if (fill) {
    return (
      <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5">
        {header}
        <ScrollingCardBody>{children}</ScrollingCardBody>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE.out }}
      className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
    >
      {header}
      <div className="space-y-2 text-[15px] leading-relaxed text-foreground">{children}</div>
    </motion.div>
  );
}

function ExplanationPanel({ doc, onFavToggle }: { doc: Doc; onFavToggle: () => void }) {
  const { t } = useI18n();
  const exp = doc.explanation ?? {};

  // The explanation sections, listed once so the two arrangements below cannot
  // drift apart: a swipeable deck on mobile, and the existing vertical stack
  // from `sm` up, where there is room to see everything at once. Same sections,
  // same order, same text — only the arrangement differs.
  const sections = [
    exp.explanation && {
      key: "explanation",
      icon: GraduationCap,
      title: t((d) => d.doc.sections.explanation),
      tone: "emerald" as const,
      text: exp.explanation,
    },
    exp.why && {
      key: "why",
      icon: Lightbulb,
      title: t((d) => d.doc.sections.why),
      tone: "default" as const,
      text: exp.why,
    },
    exp.common_mistake && {
      key: "common_mistake",
      icon: AlertTriangle,
      title: t((d) => d.doc.sections.commonMistakes),
      tone: "warn" as const,
      text: exp.common_mistake,
    },
    exp.example && {
      key: "example",
      icon: BookOpen,
      title: t((d) => d.doc.sections.example),
      tone: "default" as const,
      text: exp.example,
    },
    exp.analogy && {
      key: "analogy",
      icon: Shapes,
      title: t((d) => d.doc.sections.analogy),
      tone: "default" as const,
      text: exp.analogy,
    },
  ].filter((s): s is Exclude<typeof s, false | undefined | ""> => Boolean(s));

  const renderCards = (fill: boolean) =>
    sections.map((s) => (
      <ExplanationCard key={s.key} icon={s.icon} title={s.title} tone={s.tone} fill={fill}>
        <RichAnswer text={s.text} />
      </ExplanationCard>
    ));

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile favorite bar */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={onFavToggle}
          className={[
            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
            doc.favorite
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
              : "border-border bg-surface text-muted-foreground",
          ].join(" ")}
        >
          <Star className={`h-3.5 w-3.5 ${doc.favorite ? "fill-current" : ""}`} />
          {doc.favorite ? t((d) => d.doc.favoriteRemove) : t((d) => d.doc.favoriteAdd)}
        </button>
      </div>

      {/* Mobile: one card at a time, the rest peeking behind. Desktop keeps the
          full stack. A single card needs no deck, so it just renders. */}
      {sections.length > 1 ? (
        <>
          <ExplanationDeck cards={renderCards(true)} />
          <div className="hidden flex-col gap-4 sm:flex">{renderCards(false)}</div>
          <DeckIntro />
        </>
      ) : (
        <div className="flex flex-col gap-4">{renderCards(false)}</div>
      )}

      {/* Conversation CTA — the natural next step after reading the answer.
          Opens a dedicated, full-height conversation for this analysis instead
          of a cramped embedded box. The reference sections follow. */}
      <Link
        to="/doc/$docId/chat"
        params={{ docId: doc.id }}
        onClick={() => track("tutor_opened")}
        className="group flex items-center gap-4 rounded-3xl border border-emerald/25 bg-card p-5 shadow-[var(--shadow-soft)] transition hover:border-emerald/40 hover:shadow-[var(--shadow-lift)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald text-white shadow-[var(--shadow-soft)]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold leading-tight text-foreground">
            {t((d) => d.doc.askCta)}
          </div>
          <p className="mt-0.5 text-[13.5px] leading-snug text-muted-foreground">
            {t((d) => d.doc.askSubtitle)}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-emerald" />
      </Link>
    </div>
  );
}

function FailedView({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="mt-5 text-xl font-bold">{t((d) => d.doc.failed)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error ?? t((d) => d.doc.retry)}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
      >
        <RefreshCw className="h-4 w-4" /> {t((d) => d.doc.retry)}
      </button>
    </div>
  );
}
