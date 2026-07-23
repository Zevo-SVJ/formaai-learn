import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { COUNTRIES, countryName } from "@/lib/countries";
import { CheckCircle2, Search, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Forma AI" },
      { name: "description", content: "Personalize Forma AI for how you study." },
    ],
  }),
  component: Onboarding,
});


type Answers = {
  goal?: string;
  grade?: string;
  country?: string;
  subjects: string[];
};

const STORAGE_KEY = "forma:onboarded";
const ANSWERS_KEY = "forma:onboardingAnswers";

function Onboarding() {
  const navigate = useNavigate();
  // A short reassuring bridge from the analysis to the questions. It makes
  // clear the questions personalize the tutor rather than repeat the work, and
  // is not one of the counted onboarding steps.
  const [intro, setIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ subjects: [] });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ANSWERS_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: Answers) => {
    setAnswers(next);
    try {
      window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const finish = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    // Authentication happens at the very end of onboarding.
    navigate({ to: "/auth", search: { mode: "signup" } as never });
  };


  const totalSteps = 7; // Q1, insight1, Q2, Q3, insight2, Q4, loading
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:py-5">
        <Logo />
        {!intro && <StepIndicator current={step + 1} total={totalSteps} />}
      </header>
      <main className="mx-auto flex max-w-xl flex-col px-5 pb-16">
        <AnimatePresence mode="wait">
          {intro && (
            <Step key="intro">
              <IntroTransition onStart={() => setIntro(false)} />
            </Step>
          )}
          {!intro && step === 0 && (
            <Step key="q1">
              <QuestionSingle
                titleKey={(d) => d.onboarding.q1.title}
                subtitleKey={(d) => d.onboarding.q1.subtitle}
                selected={answers.goal}
                optionsSelector={(d) => d.onboarding.q1.options}
                onPick={(id) => {
                  persist({ ...answers, goal: id });
                  setStep(1);
                }}
              />
            </Step>
          )}
          {step === 1 && (
            <Step key="insight1">
              <Insight
                eyebrowKey={(d) => d.onboarding.insight1.eyebrow}
                statKey={(d) => d.onboarding.insight1.stat}
                punchKey={(d) => d.onboarding.insight1.punch}
                captionKey={(d) => d.onboarding.insight1.caption}
                onNext={() => setStep(2)}
              />
            </Step>
          )}
          {step === 2 && (
            <Step key="q2">
              <QuestionSingle
                titleKey={(d) => d.onboarding.q2.title}
                subtitleKey={(d) => d.onboarding.q2.subtitle}
                selected={answers.grade}
                optionsSelector={(d) => d.onboarding.q2.options}
                onPick={(id) => {
                  persist({ ...answers, grade: id });
                  setStep(3);
                }}
              />
            </Step>
          )}
          {step === 3 && (
            <Step key="q3">
              <CountryStep
                selected={answers.country}
                onPick={(code) => {
                  persist({ ...answers, country: code });
                  setStep(4);
                }}
              />
            </Step>
          )}
          {step === 4 && (
            <Step key="insight2">
              <Insight
                eyebrowKey={(d) => d.onboarding.insight2.eyebrow}
                statKey={(d) => d.onboarding.insight2.stat}
                punchKey={(d) => d.onboarding.insight2.punch}
                captionKey={(d) => d.onboarding.insight2.caption}
                onNext={() => setStep(5)}
              />
            </Step>
          )}
          {step === 5 && (
            <Step key="q4">
              <SubjectsStep
                selected={answers.subjects}
                onSubmit={(subjects) => {
                  persist({ ...answers, subjects });
                  setStep(6);
                }}
              />
            </Step>
          )}
          {step === 6 && (
            <Step key="loading">
              <LoadingStep onDone={finish} />
            </Step>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t((d) => d.onboarding.stepOf, { current, total })}
      </span>
      <div className="flex h-1 w-28 gap-1 sm:w-36">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i < current ? "bg-foreground" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE.out }}
      className="pt-4 sm:pt-8"
    >
      {children}
    </motion.section>
  );
}

/**
 * The bridge between the finished analysis and the questions. Short and
 * reassuring: it confirms the document was understood, then frames the coming
 * questions as personalizing the tutor — not as friction or a survey.
 */
function IntroTransition({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  const points = [
    t((d) => d.onboarding.intro.point1),
    t((d) => d.onboarding.intro.point2),
  ];
  return (
    <div className="flex flex-col items-center pt-6 text-center sm:pt-12">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE.out }}
        className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-soft"
      >
        <Sparkles className="h-7 w-7 text-emerald" strokeWidth={1.75} />
      </motion.div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald-soft/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t((d) => d.onboarding.intro.eyebrow)}
      </div>

      <h1 className="mt-5 text-[28px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
        {t((d) => d.onboarding.intro.title)}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
        {t((d) => d.onboarding.intro.subtitle)}
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5 text-left">
        {points.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE.out }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-[14.5px] font-medium text-foreground shadow-[var(--shadow-soft)]"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald" />
            {line}
          </motion.div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-9 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background transition-transform hover:-translate-y-0.5"
      >
        {t((d) => d.onboarding.intro.cta)}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

type Selector<T> = (d: import("@/i18n/en").Dict) => T;

function QuestionSingle({
  titleKey,
  subtitleKey,
  selected,
  optionsSelector,
  onPick,
}: {
  titleKey: Selector<string>;
  subtitleKey: Selector<string>;
  selected?: string;
  optionsSelector: Selector<Array<{ id: string; label: string }>>;
  onPick: (id: string) => void;
}) {
  const { t, raw } = useI18n();
  const options = raw(optionsSelector);
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t(titleKey)}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{t(subtitleKey)}</p>
      <div className="mt-8 space-y-2.5">
        {options.map((o, i) => {
          const active = selected === o.id;
          return (
            <motion.button
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: EASE.out }}
              onClick={() => onPick(o.id)}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left text-[15px] font-semibold transition-all",
                active
                  ? "border-emerald bg-emerald-soft/60 text-foreground shadow-[var(--shadow-soft)]"
                  : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-border-strong",
              ].join(" ")}
            >
              {o.label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Insight({
  eyebrowKey,
  statKey,
  punchKey,
  captionKey,
  onNext,
}: {
  eyebrowKey: Selector<string>;
  statKey: Selector<string>;
  punchKey: Selector<string>;
  captionKey: Selector<string>;
  onNext: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-6 flex flex-col items-start">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald">
        {t(eyebrowKey)}
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE.out }}
        className="mt-3 text-[34px] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
      >
        {t(statKey)}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: EASE.out }}
        className="mt-6 text-[26px] font-bold tracking-tight text-emerald sm:text-3xl"
      >
        {t(punchKey)}
      </motion.p>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {t(captionKey)}
      </p>
      <button
        onClick={onNext}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[14px] font-semibold text-background transition-transform hover:-translate-y-0.5"
      >
        {t((d) => d.onboarding.next)}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function CountryStep({ selected, onPick }: { selected?: string; onPick: (code: string) => void }) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return COUNTRIES.slice(0, 8);
    return COUNTRIES.filter((c) =>
      countryName(c, locale).toLowerCase().includes(query),
    ).slice(0, 12);
  }, [q, locale]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t((d) => d.onboarding.q3.title)}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {t((d) => d.onboarding.q3.subtitle)}
      </p>
      <div className="mt-8">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-emerald">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t((d) => d.onboarding.q3.searchPlaceholder)}
            className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {filtered.length === 0 && (
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            {t((d) => d.onboarding.q3.noResults)}
          </p>
        )}
        {filtered.map((c) => {
          const active = selected === c.code;
          return (
            <button
              key={c.code}
              onClick={() => onPick(c.code)}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all",
                active
                  ? "border-emerald bg-emerald-soft/60 shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-border-strong",
              ].join(" ")}
            >
              <span className="text-[15px] font-semibold text-foreground">
                {countryName(c, locale)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubjectsStep({
  selected,
  onSubmit,
}: {
  selected: string[];
  onSubmit: (subjects: string[]) => void;
}) {
  const { t, raw } = useI18n();
  const [picked, setPicked] = useState<string[]>(selected);
  const list = raw((d) => d.subjects.list);
  const toggle = (s: string) => {
    setPicked((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      if (prev.length >= 5) return prev;
      return [...prev, s];
    });
  };
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t((d) => d.onboarding.q4.title)}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {t((d) => d.onboarding.q4.subtitle)}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {list.map((s) => {
          const active = picked.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-semibold transition-all",
                active
                  ? "border-emerald bg-emerald text-emerald-soft"
                  : "border-border bg-surface text-foreground hover:border-border-strong",
              ].join(" ")}
              style={active ? { backgroundColor: "var(--emerald)", color: "white" } : undefined}
            >
              {active && <CheckCircle2 className="h-3.5 w-3.5" />}
              {s}
            </button>
          );
        })}
      </div>
      <button
        disabled={picked.length === 0}
        onClick={() => onSubmit(picked)}
        className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {t((d) => d.onboarding.next)}
      </button>
    </div>
  );
}

/** How long a task stays readable before it is checked off. */
const TASK_READ_MS = 1050;
/** How long its checkmark holds before the task steps aside. */
const TASK_CHECK_MS = 450;
const TASK_TOTAL_MS = TASK_READ_MS + TASK_CHECK_MS;

function LoadingStep({ onDone }: { onDone: () => void }) {
  const { t, raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const steps = raw((d) => d.onboarding.loading.steps);
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isLast = index >= steps.length - 1;

  // One task at a time: read it, check it off, let the next one take its place.
  useEffect(() => {
    if (leaving) return;
    if (!checked) {
      const id = window.setTimeout(() => setChecked(true), TASK_READ_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      if (isLast) {
        setLeaving(true);
        return;
      }
      setIndex((n) => n + 1);
      setChecked(false);
    }, TASK_CHECK_MS);
    return () => window.clearTimeout(id);
  }, [checked, isLast, leaving]);

  // Settle for a beat, then hand over without a cut.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => doneRef.current(), 700);
    return () => window.clearTimeout(id);
  }, [leaving]);

  const progress = Math.round(((index + (checked ? 1 : 0.45)) / steps.length) * 100);

  return (
    <motion.div
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.5, ease: EASE.inOut }}
      className="flex flex-col items-center pt-10 text-center sm:pt-16"
    >
      {/* The logo, breathing. Nothing else. */}
      <motion.div
        animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Logo size={88} withWordmark={false} />
      </motion.div>

      <h1 className="mt-9 text-[26px] font-bold tracking-tight text-foreground sm:text-3xl">
        {t((d) => d.onboarding.loading.title)}
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {t((d) => d.onboarding.loading.caption)}
      </p>

      {/* Real progress, moving continuously rather than in jumps. */}
      <div className="mt-9 h-1 w-full max-w-xs overflow-hidden rounded-full bg-border">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: TASK_TOTAL_MS / 2000, ease: "linear" }}
          className="h-full rounded-full bg-foreground"
        />
      </div>

      {/* Exactly one task at a time. */}
      <div className="relative mt-7 h-8 w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.42, ease: EASE.out }}
            className="absolute inset-0 flex items-center justify-center gap-2.5"
          >
            <TaskCheck checked={checked} />
            <span className="text-[15px] font-medium text-foreground">{steps[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** A checkmark that draws itself once the task is complete. */
function TaskCheck({ checked }: { checked: boolean }) {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <motion.span
        className="absolute inset-0 rounded-full border border-border"
        animate={{ opacity: checked ? 0 : 1, scale: checked ? 0.7 : 1 }}
        transition={{ duration: 0.28, ease: EASE.inOut }}
      />
      <motion.span
        className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald text-white"
        initial={false}
        animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.7 }}
        transition={{ duration: 0.32, ease: EASE.out }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6 9 17l-5-5"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.34, delay: checked ? 0.08 : 0, ease: EASE.out }}
          />
        </svg>
      </motion.span>
    </span>
  );
}
