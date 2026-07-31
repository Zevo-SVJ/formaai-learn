import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Shapes,
  Maximize2,
  Check,
  FolderPlus,
} from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { RichAnswer } from "@/components/RichAnswer";
import { CardPreviewBody } from "@/components/CardPreviewBody";
import { ExplanationDeck } from "@/components/ExplanationDeck";
import { CardDetail, type DetailCard } from "@/components/CardDetail";
import { useCollections } from "@/hooks/useCollections";
import { saveAnalysis, saveCard, removeCard, type CollectionSource } from "@/lib/collections";

export type Section = {
  /** Stable across a save, so a stored card can find its icon again. */
  key: string;
  title: string;
  tone: "default" | "emerald" | "warn";
  text: string;
};

/**
 * The icon each section wears. Kept here rather than stored with a saved card,
 * because a component cannot be serialised — a collection remembers the section
 * key and looks the icon back up.
 */
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  explanation: GraduationCap,
  why: Lightbulb,
  common_mistake: AlertTriangle,
  example: BookOpen,
  analogy: Shapes,
};

export function sectionIcon(key: string) {
  return SECTION_ICONS[key] ?? Lightbulb;
}

/**
 * The whole card experience for one analysis: the deck, the reader, and the two
 * ways to keep it.
 *
 * A saved collection renders this same component with the sections it stored,
 * so "open a collection" and "read a fresh analysis" are not two experiences
 * that have to be kept in step — they are one.
 */
export function AnalysisCards({
  sections,
  source,
  answer,
}: {
  sections: Section[];
  source: CollectionSource;
  /** The main answer, kept alongside the cards when the analysis is saved. */
  answer: string | null;
}) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const collections = useCollections();
  const stored = collections.find((c) => c.id === source.id) ?? null;

  const isSaved = (key: string) => Boolean(stored?.cards.some((c) => c.key === key));
  const allSaved = sections.length > 0 && sections.every((s) => isSaved(s.key));

  const renderCards = (fill: boolean) =>
    sections.map((s, i) => (
      <ExplanationCard
        key={s.key}
        icon={sectionIcon(s.key)}
        title={s.title}
        tone={s.tone}
        fill={fill}
        onOpen={fill ? undefined : () => setOpenIndex(i)}
      >
        <RichAnswer text={s.text} />
      </ExplanationCard>
    ));

  const open = openIndex === null ? null : sections[openIndex];
  const detail: DetailCard | null = open ? { ...open, icon: sectionIcon(open.key) } : null;

  const toggleCard = () => {
    if (!open) return;
    if (isSaved(open.key)) removeCard(source.id, open.key);
    else saveCard(source, { key: open.key, title: open.title, tone: open.tone, text: open.text });
  };

  const keepAll = () => {
    saveAnalysis(
      source,
      sections.map((s) => ({ key: s.key, title: s.title, tone: s.tone, text: s.text })),
      answer,
    );
  };

  return (
    <>
      {/* Mobile: one card at a time, the rest peeking behind. Desktop keeps the
          full stack. A single card needs no deck, so it just renders. */}
      {sections.length > 1 ? (
        <>
          <ExplanationDeck cards={renderCards(true)} onOpenCard={setOpenIndex} />
          <div className="hidden flex-col gap-4 sm:flex">{renderCards(false)}</div>
        </>
      ) : (
        <div className="flex flex-col gap-4">{renderCards(false)}</div>
      )}

      {/* Keeping the lesson: deliberately quiet, and it says what it did. How
          the cards work is taught once, in onboarding — nothing here repeats
          it. */}
      <div className="flex justify-center">
        <button
          onClick={keepAll}
          disabled={allSaved}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition",
            allSaved
              ? "border-emerald/30 bg-emerald-soft text-emerald"
              : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
          ].join(" ")}
        >
          <motion.span
            key={allSaved ? "saved" : "save"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 420 }}
            className="flex items-center gap-2"
          >
            {allSaved ? <Check className="h-3.5 w-3.5" /> : <FolderPlus className="h-3.5 w-3.5" />}
            {allSaved ? t((d) => d.doc.deck.analysisSaved) : t((d) => d.doc.deck.saveAnalysis)}
          </motion.span>
        </button>
      </div>

      <CardDetail
        card={detail}
        saved={open ? isSaved(open.key) : false}
        onSave={toggleCard}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}

/**
 * One explanation card.
 *
 * Two shapes, same content and same markup order. By default it is as tall as
 * its text — the vertical stack from `sm` up. With `fill` it takes the height
 * of whatever frame it is given and pins its header, showing as much of the
 * text as fits and fading out the rest — that is what lets the deck keep every
 * card exactly the same size no matter how long the explanation is. The shadow
 * is left off in `fill`, since there the deck owns elevation and varies it by
 * depth.
 */
function ExplanationCard({
  icon: Icon,
  title,
  children,
  tone = "default",
  fill = false,
  onOpen,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "emerald" | "warn";
  fill?: boolean;
  /** Only outside the deck: in the deck the whole card is the target. */
  onOpen?: () => void;
}) {
  const { t } = useI18n();
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
      <h3 className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {/* A button rather than the whole card: outside the deck the text is
          long-form and has to stay selectable. */}
      {onOpen && (
        <button
          onClick={onOpen}
          aria-label={t((d) => d.doc.deck.openCard)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  if (fill) {
    return (
      <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5">
        {header}
        <CardPreviewBody>{children}</CardPreviewBody>
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
