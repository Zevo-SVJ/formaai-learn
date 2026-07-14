import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "@/lib/documents.functions";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
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
  explanation: {
    explanation?: string;
    why?: string;
    common_mistake?: string;
    example?: string;
    analogy?: string;
  } | null;
  error: string | null;
};

const stageLabel: Record<string, string> = {
  uploading: "Uploading document",
  extracting: "Reading the document",
  analyzing: "Understanding the lesson",
  ready: "Ready",
  failed: "Something went wrong",
};

function DocPage() {
  const { docId } = Route.useParams();
  const navigate = useNavigate();
  const getDoc = useServerFn(getDocument);
  const getMsgs = useServerFn(getMessages);
  const signFile = useServerFn(getSignedFileUrl);
  const retry = useServerFn(analyzeDocument);

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

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!doc?.storage_path) return;
    signFile({ data: { path: doc.storage_path } })
      .then(({ url }) => setFileUrl(url))
      .catch(() => setFileUrl(null));
  }, [doc?.storage_path, signFile]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate({ to: "/library" })}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-border-strong"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold leading-tight text-foreground">
                {doc?.title ?? "Loading..."}
              </div>
              {doc && (doc.subject || doc.level) && (
                <div className="truncate text-[11px] text-muted-foreground">
                  {[doc.subject, doc.level, doc.chapter].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </div>
          <Link to="/library" className="hidden sm:block"><Logo /></Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {!doc && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {doc && doc.status !== "ready" && (
          <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
            {doc.status === "failed" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="mt-5 text-xl font-bold">Analysis failed</h2>
                <p className="mt-2 text-sm text-muted-foreground">{doc.error ?? "Please try again."}</p>
                <button
                  onClick={async () => {
                    try {
                      await retry({ data: { documentId: doc.id } });
                      refetch();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Retry failed");
                    }
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-soft">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald" />
                </div>
                <h2 className="mt-5 text-xl font-bold">{stageLabel[doc.status] ?? "Working"}</h2>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Forma AI is really reading your document — not faking it. This usually takes 5–15
                  seconds.
                </p>
              </>
            )}
          </div>
        )}

        {doc && doc.status === "ready" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <DocumentViewer doc={doc} fileUrl={fileUrl} />
            <ExplanationPanel doc={doc} initialMessages={initialMessages ?? []} />
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

function Section({
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
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="prose prose-sm max-w-none text-[15px] leading-relaxed text-foreground [&>p]:my-2 [&>ul]:my-2">
        {children}
      </div>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { label: "Explain differently", prompt: "Explain this in a different way." },
  { label: "Explain like I'm 10", prompt: "Explain this like I'm 10 years old." },
  { label: "Another example", prompt: "Give me another simple worked example." },
  { label: "Summarize", prompt: "Summarize the lesson in 5 short bullet points." },
  { label: "Flashcards", prompt: "Create 5 flashcards (Q on one line, A on next) from this lesson." },
  { label: "Quiz me", prompt: "Give me a 3-question quiz on this lesson. Ask one at a time and wait for my answer." },
];

function ExplanationPanel({
  doc,
  initialMessages,
}: {
  doc: Doc;
  initialMessages: Array<{ id: string; role: string; content: string }>;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
        body: { documentId: doc.id },
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (data.session?.access_token)
            headers.set("Authorization", `Bearer ${data.session.access_token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [doc.id],
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
      {exp.explanation && (
        <Section icon={Sparkles} title="Explanation" tone="emerald">
          <ReactMarkdown>{exp.explanation}</ReactMarkdown>
        </Section>
      )}
      {exp.why && (
        <Section icon={Lightbulb} title="Why this matters">
          <ReactMarkdown>{exp.why}</ReactMarkdown>
        </Section>
      )}
      {exp.common_mistake && (
        <Section icon={AlertTriangle} title="Common mistake" tone="warn">
          <ReactMarkdown>{exp.common_mistake}</ReactMarkdown>
        </Section>
      )}
      {exp.example && (
        <Section icon={BookOpen} title="Simple example">
          <ReactMarkdown>{exp.example}</ReactMarkdown>
        </Section>
      )}
      {exp.analogy && (
        <Section icon={Wand2} title="Analogy">
          <ReactMarkdown>{exp.analogy}</ReactMarkdown>
        </Section>
      )}

      {/* Chat */}
      <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="border-b border-border px-5 py-3">
          <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Ask Forma about this lesson
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[420px] overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask anything about the lesson. Forma already read it.
            </p>
          )}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed",
                        m.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-surface-muted text-foreground",
                      ].join(" ")}
                    >
                      <div className="prose prose-sm max-w-none [&>p]:my-1.5 [&>ul]:my-1.5">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    </div>
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
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => submit(a.prompt)}
                disabled={isBusy}
                className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-border-strong disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>
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
              placeholder="Ask about anything in the lesson..."
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
