import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ListChecks, ClipboardList, Layers } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { AnswerRenderer } from "@/components/AnswerRenderer";
import { extractResource, saveResource, type Resource, type ResourceKind } from "@/lib/resources";

const ICONS: Record<ResourceKind, React.ComponentType<{ className?: string }>> = {
  quiz: ListChecks,
  sheet: ClipboardList,
  deck: Layers,
};

/**
 * An assistant message that may be carrying a resource.
 *
 * When it is, the resource does not get printed into the conversation: it is
 * put away where it belongs and the chat shows the way to it. A quiz read as a
 * wall of text is not a quiz, and a revision sheet scrolled past between two
 * replies is lost the moment the next question is asked.
 *
 * Saving happens once the block has finished streaming, not on every token, so
 * a half-built resource is never stored.
 */
export function ResourceHandoff({ text, sourceId }: { text: string; sourceId: string | null }) {
  const { t } = useI18n();
  const { body, found } = extractResource(text);
  const [saved, setSaved] = useState<Resource | null>(null);

  useEffect(() => {
    if (!found || saved) return;
    const resource: Resource = {
      ...found,
      // Stable for this message, so a re-render never duplicates it.
      id: `${sourceId ?? "chat"}-${found.kind}-${hash(JSON.stringify(found))}`,
      sourceId,
      createdAt: new Date().toISOString(),
      title: found.title || t((d) => d.resources[found.kind]),
    };
    saveResource(resource);
    setSaved(resource);
    // `found` is derived from `text`, so the text is the real dependency.
  }, [text, found, saved, sourceId, t]);

  return (
    <>
      {body && <AnswerRenderer text={body} />}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE.out }}
          className="mt-3"
        >
          <Link
            to="/resource/$id"
            params={{ id: saved.id }}
            className="group flex items-center gap-3.5 rounded-2xl border border-emerald/30 bg-card p-4 shadow-[var(--shadow-soft)] transition hover:border-emerald/50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
              {(() => {
                const Icon = ICONS[saved.kind];
                return <Icon className="h-5 w-5 text-emerald" />;
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t((d) => d.resources[saved.kind])}
              </div>
              <div className="truncate text-[15px] font-semibold text-foreground">
                {saved.title}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-emerald">
              {t((d) => d.resources.open)}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </motion.div>
      )}
    </>
  );
}

/** Enough to tell two resources apart, not a checksum. */
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
