/**
 * Saved analyses, kept on the device.
 *
 * A collection is one analysed lesson the student chose to keep. Saving the
 * whole analysis stores its answer and every card; saving a single card from
 * the reader stores just that one. Either way there is one collection per
 * lesson, so a card saved today and the rest saved tomorrow end up together
 * rather than as two entries that look like duplicates.
 *
 * Storage is `localStorage` rather than the database: this is a presentation
 * feature and the analysis tables are not ours to change here. The trade-off is
 * real and worth stating — a collection lives on the device that made it and
 * does not follow the student to another one. Moving it server-side later means
 * a `collections` table with the same shape as `Collection` below; nothing in
 * the UI reads storage directly, so only this file would change.
 */

const KEY = "forma:collections";

export type SavedCard = {
  /** The section this card came from, e.g. "explanation" — also its identity. */
  key: string;
  title: string;
  tone: "default" | "emerald" | "warn";
  text: string;
  /**
   * Kept on its own from the reader, rather than swept up by saving the whole
   * lesson. It is what separates the two shelves in the library: a card the
   * student singled out belongs under "saved cards" even once the rest of the
   * lesson is kept too.
   */
  alone?: boolean;
};

export type Collection = {
  /** The document id, so a lesson maps to exactly one collection. */
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  /** The main answer, kept only when the whole analysis was saved. */
  answer: string | null;
  cards: SavedCard[];
  savedAt: string;
};

/** What a collection needs to know about the lesson it came from. */
export type CollectionSource = {
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  chapter: string | null;
  concepts: string[] | null;
};

/**
 * A name a student can actually scan a list for.
 *
 * The analysis already names the topic — "Fonctions affines", "Photosynthèse" —
 * in `chapter`, and failing that in the key concepts. Both are far better than
 * the file name, and none of them is a date or a number.
 */
export function collectionTitle(source: CollectionSource): string {
  const candidates = [source.chapter, source.concepts?.[0], source.title];
  const found = candidates.find((c) => typeof c === "string" && c.trim().length > 0);
  return found ? found.trim() : source.title;
}

// One in-memory copy, so every reader sees the same array identity between
// writes and `useSyncExternalStore` does not loop.
let cache: Collection[] | null = null;
const listeners = new Set<() => void>();

function read(): Collection[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as Collection[]) : [];
  } catch {
    // Corrupt or blocked storage: start clean rather than break the page.
    cache = [];
  }
  return cache;
}

function write(next: Collection[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Full or blocked storage: the collection stays for this session only.
  }
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Newest first — the one just saved should be the one you see. */
export function listCollections(): Collection[] {
  return read();
}

export function getCollection(id: string): Collection | null {
  return read().find((c) => c.id === id) ?? null;
}

export function isCardSaved(id: string, cardKey: string): boolean {
  return Boolean(getCollection(id)?.cards.some((c) => c.key === cardKey));
}

export function isAnalysisSaved(id: string, cardCount: number): boolean {
  const existing = getCollection(id);
  return Boolean(existing && existing.cards.length >= cardCount);
}

function upsert(source: CollectionSource, apply: (existing: Collection | null) => Collection) {
  const all = read();
  const existing = all.find((c) => c.id === source.id) ?? null;
  const next = apply(existing);
  write([next, ...all.filter((c) => c.id !== source.id)]);
}

/** Keep one card. The rest of the lesson can be added later without duplicating. */
export function saveCard(source: CollectionSource, card: SavedCard) {
  upsert(source, (existing) => ({
    id: source.id,
    title: collectionTitle(source),
    subject: source.subject,
    level: source.level,
    answer: existing?.answer ?? null,
    cards: [...(existing?.cards ?? []).filter((c) => c.key !== card.key), { ...card, alone: true }],
    savedAt: new Date().toISOString(),
  }));
}

export function removeCard(id: string, cardKey: string) {
  const all = read();
  const existing = all.find((c) => c.id === id);
  if (!existing) return;
  const cards = existing.cards.filter((c) => c.key !== cardKey);
  // A collection with nothing left in it is just clutter in the library.
  if (cards.length === 0 && !existing.answer) {
    write(all.filter((c) => c.id !== id));
    return;
  }
  write([{ ...existing, cards }, ...all.filter((c) => c.id !== id)]);
}

/** Keep the whole lesson: its answer and every card, in the order shown. */
export function saveAnalysis(source: CollectionSource, cards: SavedCard[], answer: string | null) {
  upsert(source, (existing) => ({
    id: source.id,
    title: collectionTitle(source),
    subject: source.subject,
    level: source.level,
    answer,
    // Sweeping up the lesson must not quietly un-single a card the student
    // had already picked out on its own.
    cards: cards.map((c) => ({
      ...c,
      alone: existing?.cards.some((e) => e.key === c.key && e.alone) || undefined,
    })),
    savedAt: new Date().toISOString(),
  }));
}

export function removeCollection(id: string) {
  write(read().filter((c) => c.id !== id));
}

/** The whole lessons: those kept with their answer, newest first. */
export function listAnalyses(all: Collection[]): Collection[] {
  return all.filter((c) => c.answer !== null && c.cards.length > 0);
}

/** Every card kept on its own, with the lesson it came from. */
export type LooseCard = SavedCard & { collectionId: string; collectionTitle: string };

export function listLooseCards(all: Collection[]): LooseCard[] {
  return all.flatMap((c) =>
    c.cards
      .filter((card) => card.alone)
      .map((card) => ({ ...card, collectionId: c.id, collectionTitle: c.title })),
  );
}
