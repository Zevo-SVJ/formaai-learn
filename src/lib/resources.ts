/**
 * Things the tutor makes, kept on the device.
 *
 * A resource is something the chat produced that is worth leaving the
 * conversation for: a quiz, a revision sheet, a deck of cards. They share one
 * shape and one shelf so a seventh kind costs a `kind` and a renderer, not a
 * new storage model and a new page.
 *
 * `sourceId` is the lesson it came from, which is what lets several decks live
 * around one analysis without fighting over it: the analysis has its own deck,
 * built from the analysis itself, and anything the chat makes afterwards is a
 * separate resource pointing back at the same lesson.
 *
 * Storage is `localStorage`, alongside collections and for the same reason —
 * this is presentation, and the tables are not this change's to alter.
 */

const KEY = "forma:resources";

export const RESOURCE_KINDS = ["quiz", "sheet", "deck"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export type QuizQuestion = {
  q: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  why?: string;
};

export type DeckCard = { title: string; text: string };

export type Resource = {
  id: string;
  kind: ResourceKind;
  title: string;
  /** The lesson this was made from, when it was made from one. */
  sourceId: string | null;
  createdAt: string;
  questions?: QuizQuestion[];
  body?: string;
  cards?: DeckCard[];
};

let cache: Resource[] | null = null;
const listeners = new Set<() => void>();

function read(): Resource[] {
  if (cache) return cache;
  if (typeof window === "undefined") return (cache = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as Resource[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Resource[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Full or blocked storage: it lasts the session.
  }
  listeners.forEach((l) => l());
}

export function subscribeToResources(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Newest first — what was just made is what you are looking for. */
export function listResources(): Resource[] {
  return read();
}

export function getResource(id: string): Resource | null {
  return read().find((r) => r.id === id) ?? null;
}

export function saveResource(r: Resource) {
  write([r, ...read().filter((x) => x.id !== r.id)]);
}

export function removeResource(id: string) {
  write(read().filter((r) => r.id !== id));
}

/** Every deck made around one lesson, so they can be offered side by side. */
export function decksForSource(all: Resource[], sourceId: string): Resource[] {
  return all.filter((r) => r.kind === "deck" && r.sourceId === sourceId);
}

/**
 * Pulls a resource out of an answer.
 *
 * The tutor marks one with a fenced ```forma block holding JSON. Everything
 * about reading it is defensive: a half-streamed block, a truncated object or a
 * kind we do not know yet has to leave the answer readable as ordinary text
 * rather than take the message down with it.
 */
const FENCE = /```forma\s*\n([\s\S]*?)```/;

export type ParsedResource = { resource: Omit<Resource, "id" | "createdAt" | "sourceId"> | null };

export function extractResource(text: string): { body: string; found: ParsedResource["resource"] } {
  const match = FENCE.exec(text);
  if (!match) return { body: text, found: null };

  const body = (text.slice(0, match.index) + text.slice(match.index + match[0].length)).trim();
  try {
    const raw = JSON.parse(match[1]) as Record<string, unknown>;
    const kind = raw.kind as ResourceKind;
    if (!RESOURCE_KINDS.includes(kind)) return { body, found: null };

    const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "";
    if (kind === "quiz") {
      const questions = (Array.isArray(raw.questions) ? raw.questions : [])
        .map((q) => q as Record<string, unknown>)
        .filter((q) => typeof q.q === "string" && Array.isArray(q.options) && q.options.length >= 2)
        .map((q) => ({
          q: q.q as string,
          options: (q.options as unknown[]).map(String),
          answer: Number.isInteger(q.answer) ? (q.answer as number) : 0,
          why: typeof q.why === "string" ? q.why : undefined,
        }));
      return questions.length ? { body, found: { kind, title, questions } } : { body, found: null };
    }
    if (kind === "sheet") {
      const sheet = typeof raw.body === "string" ? raw.body.trim() : "";
      return sheet ? { body, found: { kind, title, body: sheet } } : { body, found: null };
    }
    const cards = (Array.isArray(raw.cards) ? raw.cards : [])
      .map((c) => c as Record<string, unknown>)
      .filter((c) => typeof c.text === "string" && (c.text as string).trim())
      .map((c) => ({
        title: typeof c.title === "string" ? c.title : "",
        text: c.text as string,
      }));
    return cards.length ? { body, found: { kind, title, cards } } : { body, found: null };
  } catch {
    // Not valid JSON yet, or never will be: the answer still reads fine.
    return { body, found: null };
  }
}

/** A block is only complete once its closing fence has streamed in. */
export function hasCompleteResource(text: string): boolean {
  return FENCE.test(text);
}
