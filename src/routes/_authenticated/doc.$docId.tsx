import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDocument,
  getMessages,
  getSignedFileUrl,
  analyzeDocument,
  toggleFavorite,
} from "@/lib/documents.functions";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { AnswerRenderer } from "@/components/AnswerRenderer";
import { AnalysisCeremony } from "@/components/AnalysisCeremony";
import { AnswersPanel } from "@/components/AnswersPanel";
import { RichAnswer } from "@/components/RichAnswer";
import { QuickActionsBar, useQuickActions } from "@/components/QuickActionsBar";
import { useI18n } from "@/hooks/useI18n";
import {
  ArrowLeft,
  Loader2,
  Send,
  Sparkles,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Wand2,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "sonner";

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
  const getMsgs = useServerFn(getMessages);
  const signFile = useServerFn(getSignedFileUrl);
  const retry = useServerFn(analyzeDocument);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();

  const { data: doc, refetch } = useQuery({
    queryKey: ["document", docId],
    queryFn: () => getDoc({ data: { id: docId } }) as Promise<Doc>,
    refetchInterval: (q) => {
      const d = q.state.data as Doc | undefined;
      return d && d.status !== "ready" && d.status !== "failed" ? 2000 : false;
    },
  });

  const { data: initialMessages } = useQuery({
    queryKey: ["messages", docId],
    queryFn: () => getMsgs({ data: { id: docId } }),
    enabled: !!doc && doc.status === "ready",
  });

  // The upload ceremony only plays for a document that was still being
  // analyzed when we arrived. Opening a finished lesson goes straight to it.
  const [ceremonyDone, setCeremonyDone] = useState(false);
  const sawPending = useRef(false);
  const pending = !!doc && doc.status !== "ready" && doc.status !== "failed";
  useEffect(() => {
    if (pending) sawPending.current = true;
  }, [pending]);
  const showResults =
    !!doc && doc.status === "ready" && (!sawPending.current || ceremonyDone);

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
    toast.success(
      next ? t((d) => d.doc.favoriteToast) : t((d) => d.doc.unfavoriteToast),
    );
    qc.invalidateQueries({ queryKey: ["document", docId] });
    qc.invalidateQueries({ queryKey: ["documents"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate({ to: "/home" })}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-border-strong"
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
                <Star
                  className={`h-3.5 w-3.5 ${doc.favorite ? "fill-current" : ""}`}
                />
                {doc.favorite
                  ? t((d) => d.doc.favoriteRemove)
                  : t((d) => d.doc.favoriteAdd)}
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

        {doc && doc.status === "failed" && (
          <FailedView
            error={doc.error}
            onRetry={async () => {
              try {
                await retry({ data: { documentId: doc.id } });
                refetch();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Retry failed");
              }
            }}
          />
        )}

        {doc && doc.status !== "failed" && !showResults && (
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
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <DocumentViewer doc={doc} fileUrl={fileUrl} />
              <ExplanationPanel
                doc={doc}
                initialMessages={initialMessages ?? []}
                onFavToggle={onFavToggle}
              />
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

function ExplanationCard({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "emerald" | "warn";
}) {
  const bg =
    tone === "emerald"
      ? "bg-emerald-soft"
      : tone === "warn"
        ? "bg-amber-500/10"
        : "bg-surface-muted";
  const color =
    tone === "emerald" ? "text-emerald" : tone === "warn" ? "text-amber-600" : "text-foreground";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-2 text-[15px] leading-relaxed text-foreground">{children}</div>
    </motion.div>
  );
}

function ExplanationPanel({
  doc,
  initialMessages,
  onFavToggle,
}: {
  doc: Doc;
  initialMessages: Array<{ id: string; role: string; content: string }>;
  onFavToggle: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();
  const quickActions = useQuickActions();

  const seedMessages: UIMessage[] = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role === "assistant" ? "assistant" : "user",
        parts: [{ type: "text", text: m.content }],
      })) as UIMessage[],
    [initialMessages],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { documentId: doc.id, locale },
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (data.session?.access_token)
            headers.set("Authorization", `Bearer ${data.session.access_token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [doc.id, locale],
  );

  const { messages, sendMessage, status } = useChat({
    id: doc.id,
    messages: seedMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const t = text.trim();
    if (!t || isBusy) return;
    setInput("");
    await sendMessage({ text: t });
  };

  const exp = doc.explanation ?? {};

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile favorite bar */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={onFavToggle}
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            doc.favorite
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
              : "border-border bg-surface text-muted-foreground",
          ].join(" ")}
        >
          <Star className={`h-3.5 w-3.5 ${doc.favorite ? "fill-current" : ""}`} />
          {doc.favorite ? t((d) => d.doc.favoriteRemove) : t((d) => d.doc.favoriteAdd)}
        </button>
      </div>

      {exp.explanation && (
        <ExplanationCard icon={Sparkles} title={t((d) => d.doc.sections.explanation)} tone="emerald">
          <RichAnswer text={exp.explanation} />
        </ExplanationCard>
      )}
      {exp.why && (
        <ExplanationCard icon={Lightbulb} title={t((d) => d.doc.sections.why)}>
          <RichAnswer text={exp.why} />
        </ExplanationCard>
      )}
      {exp.common_mistake && (
        <ExplanationCard
          icon={AlertTriangle}
          title={t((d) => d.doc.sections.commonMistakes)}
          tone="warn"
        >
          <RichAnswer text={exp.common_mistake} />
        </ExplanationCard>
      )}
      {exp.example && (
        <ExplanationCard icon={BookOpen} title={t((d) => d.doc.sections.example)}>
          <RichAnswer text={exp.example} />
        </ExplanationCard>
      )}
      {exp.analogy && (
        <ExplanationCard icon={Wand2} title={t((d) => d.doc.sections.analogy)}>
          <RichAnswer text={exp.analogy} />
        </ExplanationCard>
      )}

      {/* Chat */}
      <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="border-b border-border px-5 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t((d) => d.doc.askTitle)}
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[520px] overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t((d) => d.doc.empty)}
            </p>
          )}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                const isUser = m.role === "user";
                const isLastAssistant =
                  !isUser &&
                  messages.slice(idx + 1).every((mm) => mm.role !== "assistant");
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={isUser ? "flex justify-end" : ""}
                  >
                    {isUser ? (
                      <div className="max-w-[85%] rounded-2xl bg-foreground px-4 py-2.5 text-[14.5px] leading-relaxed text-background">
                        {text}
                      </div>
                    ) : (
                      <div>
                        <AnswerRenderer text={text} compact />
                        {isLastAssistant && !isBusy && (
                          <QuickActionsBar onPick={submit} disabled={isBusy} />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {isBusy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-surface-muted px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border px-3 py-3">
          {messages.length === 0 && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickActions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => submit(a.prompt)}
                  disabled={isBusy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground hover:border-border-strong disabled:opacity-50"
                >
                  <a.icon className="h-3 w-3 text-emerald" />
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-emerald"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder={t((d) => d.doc.askPlaceholder)}
              className="min-h-[36px] max-h-32 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isBusy}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition disabled:opacity-40"
              aria-label="Send"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
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
