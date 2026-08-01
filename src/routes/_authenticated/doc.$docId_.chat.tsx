import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { getDocument, getMessages } from "@/lib/documents.functions";
import { supabase } from "@/integrations/supabase/client";
import { ResourceHandoff } from "@/components/ResourceHandoff";
import { Logo } from "@/components/Logo";
import { QuickActionsBar, useQuickActions } from "@/components/QuickActionsBar";
import { EASE } from "@/lib/motion";
import { pickGreeting } from "@/lib/greeting";
import { useI18n } from "@/hooks/useI18n";
import { classifyError } from "@/lib/error-message";
import { ArrowLeft, Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/doc/$docId_/chat")({
  component: ChatPage,
});

type DocLite = {
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  chapter: string | null;
  status: string;
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ChatPage() {
  const { docId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const getDoc = useServerFn(getDocument);
  const getMsgs = useServerFn(getMessages);

  const { data: doc } = useQuery({
    queryKey: ["document", docId],
    queryFn: () => getDoc({ data: { id: docId } }) as Promise<DocLite>,
  });

  const { data: initialMessages } = useQuery({
    queryKey: ["messages", docId],
    queryFn: () => getMsgs({ data: { id: docId } }),
  });

  const seedMessages: UIMessage[] = useMemo(
    () =>
      (initialMessages ?? []).map((m) => ({
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
        body: { documentId: docId, locale },
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const headers = new Headers(init?.headers);
          if (data.session?.access_token)
            headers.set("Authorization", `Bearer ${data.session.access_token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [docId, locale],
  );

  const { messages, sendMessage, status } = useChat({
    id: docId,
    messages: seedMessages,
    transport,
    onError: (e) => toast.error(t((d) => d.errors[classifyError(e)])),
  });
  const isBusy = status === "submitted" || status === "streaming";

  // Reading, not livestreaming. Generation NEVER moves the viewport: the
  // assistant's reply grows below the fold and the reader scrolls at their own
  // pace. The one and only programmatic scroll happens when the student SENDS a
  // message — a single nudge that brings their question to the top so the reply
  // begins in view. It never fires again while tokens stream, and never when
  // generation ends (so the screen can't follow the answer or jump to the end).
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserId = (msgs: UIMessage[]) => {
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") return msgs[i].id;
    return null;
  };
  // Seed the anchor from any existing history so returning to a conversation
  // does not trigger a scroll — only messages sent from here do.
  const anchoredUserIdRef = useRef<string | null>(lastUserId(seedMessages));
  useEffect(() => {
    const id = lastUserId(messages);
    if (!id || id === anchoredUserIdRef.current) return;
    anchoredUserIdRef.current = id;
    const el = scrollRef.current;
    const node = el?.querySelector<HTMLElement>(`[data-mid="${id}"]`);
    if (!el || !node) return;
    // Bring the just-sent question to the top; the reply then starts in view.
    const delta = node.getBoundingClientRect().top - el.getBoundingClientRect().top;
    el.scrollTop += delta - 12;
  }, [messages]);

  // Keep the page itself from scrolling — only the conversation area scrolls —
  // so the on-screen keyboard can never leave the whole interface shifted
  // upward after it closes. Restored when leaving the conversation.
  useEffect(() => {
    const de = document.documentElement;
    const body = document.body;
    const prev = { de: de.style.overflow, body: body.style.overflow };
    de.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      de.style.overflow = prev.de;
      body.style.overflow = prev.body;
    };
  }, []);

  const [input, setInput] = useState("");
  const quickActions = useQuickActions();

  const submit = async (text: string) => {
    const clean = text.trim();
    if (!clean || isBusy) return;
    setInput("");
    track("tutor_message_sent");
    await sendMessage({ text: clean });
  };

  // The greeting reuses the same system as Home: the onboarding first name and
  // country, resolved to a time-aware line. Kept stable here (no idle refresh)
  // so it never shifts while the student is mid-thought.
  const onboarding = useMemo(() => {
    try {
      return JSON.parse(window.localStorage.getItem("forma:onboardingAnswers") || "{}") as {
        name?: string;
        country?: string;
      };
    } catch {
      return {};
    }
  }, []);
  const greetName = useMemo(() => {
    const n = onboarding.name && onboarding.name.trim();
    if (n) return n;
    return user?.email ? user.email.split("@")[0] : null;
  }, [onboarding, user]);
  const greeting = useMemo(() => {
    const g = pickGreeting({ countryCode: onboarding.country, idle: false });
    return greetName
      ? t((d) => d.home.greet[g.key], { name: capitalize(greetName), count: g.count ?? 0 })
      : t((d) => d.home.greetAnon[g.key], { count: g.count ?? 0 });
  }, [onboarding.country, greetName, t]);

  const back = () => navigate({ to: "/doc/$docId", params: { docId } });

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header — back to the analysis, with the document as the visible context. */}
      <header className="safe-top sticky top-0 z-30 shrink-0 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={back}
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
          <Link to="/home" className="hidden sm:block">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Conversation — full height, comfortable reading width. */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE.out }}
              className="flex min-h-[60dvh] flex-col items-center justify-center text-center"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald text-white shadow-[var(--shadow-soft)]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h1 className="text-[24px] font-bold tracking-tight text-foreground sm:text-[28px]">
                {greeting}
              </h1>
              <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
                {t((d) => d.doc.empty)}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {quickActions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => submit(a.prompt)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold text-foreground transition hover:border-border-strong hover:bg-surface-muted disabled:opacity-50"
                  >
                    <a.icon className="h-3.5 w-3.5 text-emerald" />
                    {a.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => {
                  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                  const isUser = m.role === "user";
                  const isLastAssistant =
                    !isUser && messages.slice(idx + 1).every((mm) => mm.role !== "assistant");
                  return (
                    <motion.div
                      key={m.id}
                      data-mid={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE.out }}
                      className={isUser ? "flex justify-end" : ""}
                    >
                      {isUser ? (
                        <div className="max-w-[85%] rounded-2xl bg-foreground px-4 py-2.5 text-[15px] leading-relaxed text-background [overflow-wrap:anywhere]">
                          {text}
                        </div>
                      ) : (
                        <div className="text-[15px] leading-relaxed">
                          <ResourceHandoff text={text} sourceId={docId} />
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
          )}
        </div>
      </div>

      {/* Input — fixed at the bottom, same comfortable width. */}
      <div className="safe-bottom shrink-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
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
              // Safety net for iOS: if dismissing the keyboard leaves the page
              // nudged, snap it back so nothing stays shifted upward.
              onBlur={() => window.scrollTo(0, 0)}
              rows={1}
              placeholder={t((d) => d.doc.askPlaceholder)}
              className="min-h-[36px] max-h-40 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isBusy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition hover:opacity-90 disabled:opacity-40"
              aria-label={t((d) => d.doc.askCta)}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
