import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getDocument, getSignedFileUrl, analyzeDocument } from "@/lib/documents.functions";
import { Logo } from "@/components/Logo";
import { AnalysisCeremony } from "@/components/AnalysisCeremony";
import { AnswersPanel } from "@/components/AnswersPanel";
import { useI18n } from "@/hooks/useI18n";
import { classifyError } from "@/lib/error-message";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { AnalysisCards, type Section } from "@/components/AnalysisCards";

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
              <ExplanationPanel doc={doc} />
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
  // The signed URL is fetched after the lesson itself, so on an already
  // analysed document the explanations are ready long before the picture. Two
  // things keep that from looking like a page assembling itself out of order:
  // the frame holds its size from the first paint, so nothing around it moves;
  // and the image is revealed only once it has decoded, so it arrives whole
  // instead of painting in bands over the placeholder.
  const [shown, setShown] = useState(false);

  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-soft)] lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)]">
      <div className="relative flex h-full min-h-[42svh] items-center justify-center overflow-hidden rounded-2xl bg-surface-muted lg:min-h-0">
        {isImage ? (
          <>
            {fileUrl && (
              <img
                src={fileUrl}
                alt={doc.title}
                decoding="async"
                onLoad={() => setShown(true)}
                className="max-h-full max-w-full object-contain transition-opacity duration-300"
                style={{ opacity: shown ? 1 : 0 }}
              />
            )}
            {!shown && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        ) : !fileUrl ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

function ExplanationPanel({ doc }: { doc: Doc }) {
  const { t } = useI18n();
  const exp = doc.explanation ?? {};

  // The explanation sections, in the order the analysis produced them. The
  // cards, the reader and the two ways to keep them all live in AnalysisCards,
  // so a saved collection replays exactly this experience rather than a copy of
  // it that has to be kept in step.
  const sections: Section[] = [
    exp.explanation && {
      key: "explanation",
      title: t((d) => d.doc.sections.explanation),
      tone: "emerald" as const,
      text: exp.explanation,
    },
    exp.why && {
      key: "why",
      title: t((d) => d.doc.sections.why),
      tone: "default" as const,
      text: exp.why,
    },
    exp.common_mistake && {
      key: "common_mistake",
      title: t((d) => d.doc.sections.commonMistakes),
      tone: "warn" as const,
      text: exp.common_mistake,
    },
    exp.example && {
      key: "example",
      title: t((d) => d.doc.sections.example),
      tone: "default" as const,
      text: exp.example,
    },
    exp.analogy && {
      key: "analogy",
      title: t((d) => d.doc.sections.analogy),
      tone: "default" as const,
      text: exp.analogy,
    },
  ].filter((s): s is Section => Boolean(s));

  return (
    <div className="flex flex-col gap-4">
      <AnalysisCards
        sections={sections}
        source={{
          id: doc.id,
          title: doc.title,
          subject: doc.subject,
          level: doc.level,
          chapter: doc.chapter,
          concepts: doc.concepts,
        }}
        answer={exp.explanation ?? null}
      />

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
