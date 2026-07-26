// Time-of-day greetings. The country a student picks during onboarding gives
// us their timezone, so the greeting matches their local morning / afternoon /
// evening. If the country is unknown or its zone can't be resolved, we fall
// back to the device clock, which is already the user's local time.

const COUNTRY_TZ: Record<string, string> = {
  FR: "Europe/Paris", BE: "Europe/Brussels", CH: "Europe/Zurich", LU: "Europe/Luxembourg",
  CA: "America/Toronto", US: "America/New_York", GB: "Europe/London", IE: "Europe/Dublin",
  ES: "Europe/Madrid", PT: "Europe/Lisbon", IT: "Europe/Rome", DE: "Europe/Berlin",
  AT: "Europe/Vienna", NL: "Europe/Amsterdam", DK: "Europe/Copenhagen", SE: "Europe/Stockholm",
  NO: "Europe/Oslo", FI: "Europe/Helsinki", PL: "Europe/Warsaw", CZ: "Europe/Prague",
  GR: "Europe/Athens", RO: "Europe/Bucharest", TR: "Europe/Istanbul",
  MA: "Africa/Casablanca", DZ: "Africa/Algiers", TN: "Africa/Tunis", SN: "Africa/Dakar",
  CI: "Africa/Abidjan", CM: "Africa/Douala",
  MX: "America/Mexico_City", BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires",
  CO: "America/Bogota", CL: "America/Santiago",
  AU: "Australia/Sydney", NZ: "Pacific/Auckland",
};

export type Daypart = "morning" | "afternoon" | "evening";

/** Current hour (0–23) in the user's country, or the device clock as fallback. */
export function localHour(countryCode?: string | null): number {
  const tz = countryCode ? COUNTRY_TZ[countryCode] : undefined;
  if (tz) {
    try {
      const s = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date());
      const n = parseInt(s, 10);
      if (Number.isFinite(n)) return n;
    } catch {
      // unknown timezone — fall through to the device clock
    }
  }
  return new Date().getHours();
}

export function daypart(countryCode?: string | null): Daypart {
  const h = localHour(countryCode);
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

// A contextual greeting: which line to show based on real, known signals only
// (local time, when they last opened Forma, how much they've analysed, and
// whether they've gone quiet in this session). No invented events. The result
// maps to a key under home.greet / home.greetAnon.
export type GreetKey =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "back1"
  | "back2"
  | "back3"
  | "away"
  | "milestone"
  | "idle";

export type GreetContext = {
  countryCode?: string | null;
  /** Epoch ms of the previous visit, or null on the first ever visit. */
  lastVisitMs?: number | null;
  /** Total visits so far — used only to rotate between equivalent lines. */
  visitCount?: number;
  /** Number of analyses the student has. */
  docCount?: number;
  /** True once the student has gone a while without interacting. */
  idle?: boolean;
};

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeKey(hour: number): GreetKey {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

const DAY_MS = 86_400_000;

export function pickGreeting(ctx: GreetContext): { key: GreetKey; count?: number } {
  // Gone quiet in-session → a gentle nudge, offered once they pause.
  if (ctx.idle) return { key: "idle" };

  const hour = localHour(ctx.countryCode);
  const now = Date.now();
  const last = ctx.lastVisitMs ?? null;
  const rot = ctx.visitCount ?? 0;
  const docs = ctx.docCount ?? 0;

  // Back after a few days away.
  if (last && now - last >= 3 * DAY_MS) return { key: "away" };

  // Once in a while, and only with a real body of work, acknowledge it.
  if (docs >= 8 && rot % 4 === 2) return { key: "milestone", count: docs };

  // Returning later the same day → a warm welcome back, rotated for variety.
  if (last && sameDay(new Date(last), new Date(now)) && now - last > 60_000) {
    const backs: GreetKey[] = ["back1", "back2", "back3"];
    return { key: backs[rot % backs.length] };
  }

  // Otherwise, simply the time of day.
  return { key: timeKey(hour) };
}
