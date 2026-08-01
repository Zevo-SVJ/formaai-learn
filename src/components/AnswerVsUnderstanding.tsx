import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";
import { ExplanationCard, sectionIcon } from "@/components/AnalysisCards";

/**
 * The difference, watched rather than listed.
 *
 * The section used to argue it in ten parallel sentences: one tool answers,
 * the other teaches. That is a claim about behaviour, and behaviour is the one
 * thing a list cannot show. So both tools are given the same question at the
 * same moment, side by side, and the reader watches what each one does with it.
 *
 * The left side produces the result and stops. The right side produces the same
 * result — the point is not that Forma is more correct — and then keeps going,
 * unfolding into the cards. The pause on the left is the argument, and it is
 * made by nothing happening there.
 *
 * The five lines that used to say "explains step by step" and "made to teach,
 * not to solve" are gone from the copy, because this is them. What survives in
 * text is only what a demonstration cannot show: that Forma adapts to a level,
 * builds revision material, and remembers.
 */
export function AnswerVsUnderstanding() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Watched from the wrapper, once. The whole comparison plays as one gesture
  // when the section arrives, rather than being tied to scroll position — the
  // page already has one scroll-driven sequence, and a second would make the
  // landing feel like it is holding the reader.
  const inView = useInView(ref, { once: true, margin: "-90px" });
  const on = reduceMotion || inView;

  return (
    <div ref={ref} className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-5">
      <Side
        on={on}
        label={t((d) => d.compare.otherTitle)}
        badge={t((d) => d.compare.typical)}
        muted
      />
      <Side on={on} label={null} badge={t((d) => d.compare.recommended)} />
    </div>
  );
}

function Side({
  on,
  label,
  badge,
  muted = false,
}: {
  on: boolean;
  label: string | null;
  badge: string;
  muted?: boolean;
}) {
  const { t } = useI18n();
  // Both sides receive the question at the same instant and return the same
  // result. Only what follows differs.
  const base = { duration: 0.45, ease: EASE.out };
  const CARDS = [
    { key: "explanation", tone: "emerald" as const, title: t((d) => d.doc.sections.explanation) },
    {
      key: "common_mistake",
      tone: "warn" as const,
      title: t((d) => d.doc.sections.commonMistakes),
    },
    { key: "example", tone: "default" as const, title: t((d) => d.doc.sections.example) },
  ];

  return (
    <div
      className={[
        "relative flex flex-col overflow-hidden rounded-[2rem] border p-4 sm:p-5",
        muted
          ? "border-border bg-surface-muted/60"
          : "border-emerald/40 bg-card shadow-[var(--shadow-emerald)]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        {label ? (
          <span className="truncate text-[13px] font-bold tracking-tight text-muted-foreground">
            {label}
          </span>
        ) : (
          // The mark, not the wordmark: in a column this narrow "Forma AI"
          // wraps onto two lines and runs into the badge beside it.
          <Logo size={22} withWordmark={false} />
        )}
        <span
          className={[
            "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[9.5px] sm:tracking-wider",
            muted
              ? "border border-border bg-background text-muted-foreground"
              : "bg-emerald text-white",
          ].join(" ")}
        >
          {badge}
        </span>
      </div>

      {/* The same question, put to both at once. */}
      <motion.div
        initial={reduceInitial({ opacity: 0, y: 6 })}
        animate={on ? { opacity: 1, y: 0 } : undefined}
        transition={{ ...base, delay: 0.05 }}
        className="mb-3 flex flex-col gap-1.5"
      >
        <span className="h-1.5 w-4/5 rounded-full bg-border-strong/45" />
        <span className="h-1.5 w-3/5 rounded-full bg-border-strong/45" />
      </motion.div>

      {/* The same result. Neither tool is wrong; that is not the difference. */}
      <motion.div
        initial={reduceInitial({ opacity: 0, scale: 0.94 })}
        animate={on ? { opacity: 1, scale: 1 } : undefined}
        transition={{ ...base, delay: 0.5 }}
        className={[
          "flex items-center gap-2 rounded-xl px-3 py-2.5",
          muted ? "bg-background" : "bg-emerald-soft",
        ].join(" ")}
      >
        <Check className={`h-3.5 w-3.5 ${muted ? "text-muted-foreground" : "text-emerald"}`} />
        <span
          className={`text-[13px] font-bold ${muted ? "text-muted-foreground" : "text-emerald"}`}
        >
          {t((d) => d.doc.sections.answer)}
        </span>
      </motion.div>

      {/* And here the two part company. The muted side stops — the empty space
          below its result is the whole argument, and it is made by nothing
          arriving. */}
      <div className="relative mt-3 min-h-[132px] sm:min-h-[152px]">
        {!muted && (
          <div className="absolute inset-0">
            {CARDS.map(({ key, tone, title }, i) => (
              <motion.div
                key={key}
                initial={reduceInitial({ opacity: 0, y: 18, scale: 0.96 })}
                animate={on ? { opacity: 1, y: i * 7, scale: 1 - i * 0.04 } : undefined}
                transition={{ ...base, delay: 0.95 + i * 0.12 }}
                style={{ zIndex: 3 - i }}
                className="absolute inset-x-0 top-0 h-[126px] sm:h-[146px]"
              >
                <div className="h-full rounded-2xl shadow-[var(--shadow-soft)]">
                  <ExplanationCard icon={sectionIcon(key)} title={title} tone={tone} fill>
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <span className="h-1.5 w-full rounded-full bg-border-strong/35" />
                      <span className="h-1.5 w-10/12 rounded-full bg-border-strong/35" />
                      <span className="h-1.5 w-2/3 rounded-full bg-border-strong/35" />
                    </div>
                  </ExplanationCard>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// `initial` is skipped entirely when motion is reduced, so the end state is
// what renders — the comparison is legible without a single frame playing.
function reduceInitial<T extends object>(v: T): T | false {
  if (typeof window === "undefined") return v;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? false : v;
}
