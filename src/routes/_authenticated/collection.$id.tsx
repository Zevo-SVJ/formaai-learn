import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AnalysisCards, type Section } from "@/components/AnalysisCards";
import { RichAnswer } from "@/components/RichAnswer";
import { AppHeader } from "@/components/AppHeader";
import { useCollections } from "@/hooks/useCollections";
import { removeCollection } from "@/lib/collections";
import { useI18n } from "@/hooks/useI18n";

export const Route = createFileRoute("/_authenticated/collection/$id")({
  component: CollectionPage,
});

/**
 * A kept lesson, reopened.
 *
 * It renders the very same `AnalysisCards` as a fresh analysis, from the
 * sections that were stored — so the deck, the swipe, the reader and the way a
 * card is kept are not merely similar here, they are the same code.
 */
function CollectionPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const collections = useCollections();
  const collection = collections.find((c) => c.id === id) ?? null;

  const sections: Section[] = (collection?.cards ?? []).map((c) => ({
    key: c.key,
    title: c.title,
    tone: c.tone,
    text: c.text,
  }));

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

      <main className="mx-auto max-w-3xl px-4 py-6">
        {!collection ? (
          // The only way here without a collection is a stale link or storage
          // cleared on this device; say so rather than show an empty deck.
          <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted-foreground">{t((d) => d.collections.empty)}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[24px] font-bold leading-tight tracking-tight text-foreground">
                  {collection.title}
                </h1>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {[collection.subject, collection.level].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => {
                  removeCollection(collection.id);
                  navigate({ to: "/library" });
                }}
                aria-label={t((d) => d.collections.remove)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {collection.answer && (
              <div className="rounded-3xl border border-emerald/25 bg-card p-5 shadow-[var(--shadow-soft)]">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t((d) => d.collections.answer)}
                </h2>
                <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
                  <RichAnswer text={collection.answer} />
                </div>
              </div>
            )}

            <AnalysisCards
              sections={sections}
              source={{
                id: collection.id,
                title: collection.title,
                subject: collection.subject,
                level: collection.level,
                chapter: null,
                concepts: null,
              }}
              answer={collection.answer}
            />
          </div>
        )}
      </main>
    </div>
  );
}
