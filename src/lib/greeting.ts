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
