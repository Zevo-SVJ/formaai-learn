import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

/**
 * The moment right after an upload.
 *
 * The document appears as a rectangle, morphs into a perfect circle while
 * staying visible, gets scanned, then resolves into a success mark once the
 * analysis is actually done. One task is shown at a time underneath, each one
 * held long enough to read before it is checked off and replaced.
 */

/** How long a task stays on screen before it is checked off. */
const TASK_HOLD_MS = 2100;
/** How long the checkmark stays before the task fades out. */
const TASK_CHECK_MS = 900;
/** Once the server is done we still read every task, just at a brisker pace. */
const TASK_HOLD_READY_MS = 1300;
const TASK_CHECK_READY_MS = 550;
/** Length of the closing success animation. */
const SUCCESS_MS = 1750;

type Props = {
  title: string;
  mime: string;
  fileUrl: string | null;
  extractedText: string | null;
  /** True once the analysis has actually finished server side. */
  ready: boolean;
  /** Fires when the success animation has finished playing. */
  onComplete: () => void;
};

export function AnalysisCeremony({
  title,
  mime,
  fileUrl,
  extractedText,
  ready,
  onComplete,
}: Props) {
  const { t, raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";

  const steps = raw((d) => (isImage ? d.doc.scan.steps : d.doc.scan.stepsFile));

  const [diameter, setDiameter] = useState(300);
  useEffect(() => {
    const measure = () =>
      setDiameter(Math.round(Math.min(312, Math.max(216, window.innerWidth - 104))));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Rectangle first, then the perfect circle.
  const [circled, setCircled] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setCircled(true), reduceMotion ? 0 : 620);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  // One task at a time: show → check → fade → next.
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const isLast = index >= steps.length - 1;

  useEffect(() => {
    if (succeeded) return;
    if (checked) {
      // The last task only clears once the analysis is genuinely finished.
      if (isLast) return;
      const id = window.setTimeout(
        () => {
          setIndex((n) => n + 1);
          setChecked(false);
        },
        ready ? TASK_CHECK_READY_MS : TASK_CHECK_MS,
      );
      return () => window.clearTimeout(id);
    }
    // Hold the last task open until the server catches up.
    if (isLast && !ready) return;
    const id = window.setTimeout(
      () => setChecked(true),
      ready ? TASK_HOLD_READY_MS : TASK_HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [checked, isLast, ready, succeeded, steps.length]);

  // Once everything is done, check the final task off and resolve.
  useEffect(() => {
    if (!ready || succeeded) return;
    if (!(isLast && checked)) return;
    const id = window.setTimeout(() => setSucceeded(true), TASK_CHECK_MS);
    return () => window.clearTimeout(id);
  }, [ready, isLast, checked, succeeded]);

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useEffect(() => {
    if (!succeeded) return;
    const id = window.setTimeout(() => completeRef.current(), reduceMotion ? 200 : SUCCESS_MS);
    return () => window.clearTimeout(id);
  }, [succeeded, reduceMotion]);

  const progress = Math.min(1, (index + (checked ? 1 : 0.55)) / steps.length);
  // Circumference of the progress ring: 2πr with r = (diameter + 4) / 2.
  const ring = Math.PI * (diameter + 4);

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-16">
      {/* Stage */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: diameter + 48, width: diameter + 48 }}
      >
        {/* Ambient bloom behind the subject. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            height: diameter,
            width: diameter,
            background: "var(--color-emerald-soft)",
          }}
          animate={{ opacity: succeeded ? 0.95 : [0.45, 0.7, 0.45], scale: succeeded ? 1.15 : 1 }}
          transition={
            succeeded
              ? { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
              : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* The document itself: rectangle → circle, never hidden. */}
        <motion.div
          className="relative overflow-hidden bg-surface-muted shadow-[var(--shadow-lift)]"
          initial={{
            width: Math.round(diameter * 1.16),
            height: Math.round(diameter * 0.82),
            borderRadius: 28,
          }}
          animate={{
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            scale: succeeded ? 0.86 : 1,
            opacity: succeeded ? 0 : 1,
            filter: succeeded ? "blur(6px)" : "blur(0px)",
          }}
          transition={{
            width: { duration: 0.95, ease: [0.2, 0.85, 0.2, 1] },
            height: { duration: 0.95, ease: [0.2, 0.85, 0.2, 1] },
            borderRadius: { duration: 0.95, ease: [0.2, 0.85, 0.2, 1] },
            scale: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.45, ease: "easeOut" },
            filter: { duration: 0.45 },
          }}
        >
          <Preview
            title={title}
            fileUrl={fileUrl}
            isImage={isImage}
            isPdf={isPdf}
            extractedText={extractedText}
          />

          {/* Scanning light — the subject is never static. */}
          {!succeeded && (
            <>
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="forma-scan absolute inset-x-0 h-16 bg-gradient-to-b from-emerald/0 via-emerald/25 to-emerald/0" />
                <div className="forma-scan absolute inset-x-0 h-px bg-emerald/70 [animation-delay:-0.05s]" />
              </div>
              <div
                aria-hidden
                className="forma-orbit pointer-events-none absolute -inset-1/4 opacity-40"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, oklch(0.78 0.1 155 / 0.22) 50deg, transparent 120deg, transparent 360deg)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/30" />
            </>
          )}
        </motion.div>

        {/* Progress ring that tightens as the work advances. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -rotate-90"
          width={diameter + 20}
          height={diameter + 20}
          viewBox={`0 0 ${diameter + 20} ${diameter + 20}`}
        >
          <circle
            cx={(diameter + 20) / 2}
            cy={(diameter + 20) / 2}
            r={(diameter + 4) / 2}
            fill="none"
            stroke="var(--color-emerald)"
            strokeOpacity={circled && !succeeded ? 0.16 : 0}
            strokeWidth={2}
            style={{ transition: "stroke-opacity 0.5s ease" }}
          />
          <motion.circle
            cx={(diameter + 20) / 2}
            cy={(diameter + 20) / 2}
            r={(diameter + 4) / 2}
            fill="none"
            stroke="var(--color-emerald)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={ring}
            initial={{ strokeDashoffset: ring }}
            animate={{
              strokeDashoffset: ring * (1 - progress),
              opacity: circled && !succeeded ? 1 : 0,
            }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>

        {/* Face ID style resolution. */}
        <AnimatePresence>{succeeded && <SuccessMark size={diameter} />}</AnimatePresence>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 text-center"
      >
        <h2 className="text-[20px] font-bold tracking-tight text-foreground sm:text-[24px]">
          {succeeded ? t((d) => d.doc.scan.done) : t((d) => d.doc.scan.title)}
        </h2>
        {!succeeded && (
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {t((d) => d.doc.scan.caption)}
          </p>
        )}
      </motion.div>

      {/* Exactly one task at a time. */}
      <div className="relative mt-7 h-[64px] w-full max-w-sm">
        <AnimatePresence mode="wait">
          {!succeeded && (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-5 shadow-[var(--shadow-soft)]"
            >
              <StepMark checked={checked} />
              <span
                className={[
                  "text-[15px] font-semibold transition-colors duration-500",
                  checked ? "text-muted-foreground" : "text-foreground",
                ].join(" ")}
              >
                {steps[index]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepMark({ checked }: { checked: boolean }) {
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      <AnimatePresence mode="wait">
        {checked ? (
          <motion.span
            key="check"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <motion.path
                d="M20 6 9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </svg>
          </motion.span>
        ) : (
          <motion.span
            key="spin"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-soft"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Apple-style completion: the disc lands, a ring closes, the mark draws itself. */
function SuccessMark({ size }: { size: number }) {
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{ height: size, width: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        aria-hidden
        className="absolute rounded-full border-2 border-emerald"
        style={{ height: size, width: size }}
        initial={{ scale: 0.72, opacity: 0.75 }}
        animate={{ scale: 1.22, opacity: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <motion.div
        className="flex items-center justify-center rounded-full"
        style={{
          height: size * 0.74,
          width: size * 0.74,
          background:
            "linear-gradient(180deg, oklch(0.7 0.15 155) 0%, oklch(0.56 0.135 155) 100%)",
          boxShadow: "0 24px 60px -18px oklch(0.62 0.14 155 / 0.75)",
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.9 }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ height: size * 0.4, width: size * 0.4 }}
          fill="none"
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M26 52 L43 69 L75 33"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Preview({
  title,
  fileUrl,
  isImage,
  isPdf,
  extractedText,
}: {
  title: string;
  fileUrl: string | null;
  isImage: boolean;
  isPdf: boolean;
  extractedText: string | null;
}) {
  if (!fileUrl && !extractedText) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isImage && fileUrl) {
    return <img src={fileUrl} alt={title} className="h-full w-full object-cover" />;
  }
  if (isPdf && fileUrl) {
    return (
      <iframe
        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        title={title}
        tabIndex={-1}
        className="pointer-events-none h-full w-full scale-[1.35] border-0"
      />
    );
  }
  return (
    <div className="relative h-full w-full bg-surface">
      <pre className="h-full w-full overflow-hidden p-8 text-left text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
        {extractedText ?? ""}
      </pre>
      <div className="absolute inset-0 flex items-center justify-center">
        <FileText className="h-10 w-10 text-emerald" strokeWidth={1.5} />
      </div>
    </div>
  );
}
