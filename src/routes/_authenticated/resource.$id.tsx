import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Check, X, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RichAnswer } from "@/components/RichAnswer";
import { ExplanationDeck } from "@/components/ExplanationDeck";
import { ExplanationCard, sectionIcon } from "@/components/AnalysisCards";
import { CardDetail, type DetailCard } from "@/components/CardDetail";
import { useResources } from "@/hooks/useResources";
import { removeResource, type QuizQuestion, type Resource } from "@/lib/resources";
import { useI18n } from "@/hooks/useI18n";
import { EASE } from "@/lib/motion";

export const Route = createFileRoute("/_authenticated/resource/$id")({
  component: ResourcePage,
});

/**
 * One thing the tutor made, opened properly.
 *
 * Three kinds share this page because they share everything around the
 * content — where you came from, how it is titled, how it is thrown away. Only
 * the middle differs, and adding a fourth kind means adding a branch here, not
 * a page.
 */
function ResourcePage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const resource = useResources().find((r) => r.id === id) ?? null;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        back={
          <button
            onClick={() => navigate({ to: "/library" })}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-border-strong"
            aria-label={t((d) => d.common.back)}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        }
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {!resource ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">{t((d) => d.resources.empty)}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t((d) => d.resources[resource.kind])}
                </div>
                <h1 className="mt-0.5 text-[24px] font-bold leading-tight tracking-tight text-foreground">
                  {resource.title || t((d) => d.resources[resource.kind])}
                </h1>
              </div>
              <button
                onClick={() => {
                  removeResource(resource.id);
                  navigate({ to: "/library" });
                }}
                aria-label={t((d) => d.resources.remove)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {resource.kind === "quiz" ? (
              <Quiz questions={resource.questions ?? []} />
            ) : resource.kind === "sheet" ? (
              <Sheet body={resource.body ?? ""} />
            ) : (
              <Deck resource={resource} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * A quiz, one question at a time.
 *
 * Answering is a commitment: you pick, you check, and the answer tells you why
 * before you move on. Showing all the questions at once would turn it into a
 * form to fill in, and hiding the reason would make it a score rather than
 * something learned.
 */
function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) return null;
  const q = questions[index];
  const isLast = index === questions.length - 1;

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="font-display text-[40px] font-extrabold tracking-tight text-foreground">
          {t((d) => d.resources.score, { score, total: questions.length })}
        </div>
        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13.5px] font-semibold text-foreground transition hover:border-border-strong"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t((d) => d.resources.again)}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span className="text-[11.5px] font-medium text-muted-foreground">
          {t((d) => d.resources.question, { current: index + 1, total: questions.length })}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-emerald"
            initial={false}
            animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.35, ease: EASE.out }}
          />
        </div>
      </div>

      <h2 className="mt-4 text-[17px] font-semibold leading-snug text-foreground">{q.q}</h2>

      <div className="mt-4 flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          // Before checking, only the choice is marked. After, the right answer
          // is always shown — getting it wrong should still teach the answer.
          const state = !checked
            ? isPicked
              ? "picked"
              : "idle"
            : isAnswer
              ? "right"
              : isPicked
                ? "wrong"
                : "idle";
          return (
            <button
              key={i}
              onClick={() => !checked && setPicked(i)}
              disabled={checked}
              className={[
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition",
                state === "right"
                  ? "border-emerald/40 bg-emerald-soft text-foreground"
                  : state === "wrong"
                    ? "border-destructive/40 bg-destructive/10 text-foreground"
                    : state === "picked"
                      ? "border-border-strong bg-surface-muted text-foreground"
                      : "border-border bg-surface text-foreground",
              ].join(" ")}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {state === "right" ? (
                  <Check className="h-4 w-4 text-emerald" />
                ) : state === "wrong" ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <span
                    className={`h-3.5 w-3.5 rounded-full border ${
                      state === "picked"
                        ? "border-foreground bg-foreground"
                        : "border-border-strong"
                    }`}
                  />
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {checked && q.why && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE.out }}
            className="mt-4 rounded-2xl bg-surface-muted px-4 py-3 text-[14px] leading-relaxed text-muted-foreground"
          >
            {q.why}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        disabled={picked === null}
        onClick={() => {
          if (!checked) {
            if (picked === q.answer) setScore((s) => s + 1);
            setChecked(true);
            return;
          }
          if (isLast) return setDone(true);
          setIndex((i) => i + 1);
          setPicked(null);
          setChecked(false);
        }}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-foreground py-3 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:opacity-30"
      >
        {!checked
          ? t((d) => d.resources.check)
          : isLast
            ? t((d) => d.resources.again)
            : t((d) => d.resources.next)}
      </button>
    </div>
  );
}

/** A revision sheet: long-form, set to be read rather than swiped. */
function Sheet({ body }: { body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="space-y-3 text-[16px] leading-[1.7] text-foreground">
        <RichAnswer text={body} />
      </div>
    </div>
  );
}

/** Cards the tutor made, in the deck the app already uses for cards. */
function Deck({ resource }: { resource: Resource }) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cards = resource.cards ?? [];
  const titled = cards.map((c, i) => ({
    key: String(i),
    title: c.title || t((d) => d.resources.deck),
    tone: "default" as const,
    text: c.text,
  }));

  const render = (fill: boolean) =>
    titled.map((c, i) => (
      <ExplanationCard
        key={c.key}
        icon={sectionIcon("why")}
        title={c.title}
        tone={c.tone}
        fill={fill}
        onOpen={fill ? undefined : () => setOpenIndex(i)}
      >
        <RichAnswer text={c.text} />
      </ExplanationCard>
    ));

  const open = openIndex === null ? null : titled[openIndex];
  const detail: DetailCard | null = open ? { ...open, icon: sectionIcon("why") } : null;

  return (
    <>
      {titled.length > 1 ? (
        <>
          <ExplanationDeck cards={render(true)} onOpenCard={setOpenIndex} />
          <div className="hidden flex-col gap-4 sm:flex">{render(false)}</div>
        </>
      ) : (
        <div className="flex flex-col gap-4">{render(false)}</div>
      )}
      <CardDetail
        card={detail}
        saved
        onSave={() => setOpenIndex(null)}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
