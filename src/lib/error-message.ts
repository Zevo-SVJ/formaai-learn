// Every failure a student can see has to arrive as calm, translated Forma
// wording. Supabase, the storage layer, the AI gateway and fetch itself all
// throw English technical strings ("Invalid login credentials", "Failed to
// fetch", "new row violates row-level security policy"), so the raw message is
// never shown. It is classified here and the caller renders the matching
// dictionary entry.

export type ErrorKey =
  | "network"
  | "rate"
  | "permission"
  | "notFound"
  | "server"
  | "generic"
  | "badCredentials"
  | "emailInUse"
  | "emailNotConfirmed"
  | "weakPassword";

function textOf(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: unknown }).message);
  return "";
}

function statusOf(e: unknown): number | null {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const raw = o.status ?? o.statusCode;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** Classify any thrown value into a translatable, non-technical error key. */
export function classifyError(e: unknown): ErrorKey {
  const msg = textOf(e).toLowerCase();
  const status = statusOf(e);

  // Auth first: these are the ones worth naming precisely, because the student
  // can act on them.
  if (/invalid login credentials|invalid email or password|invalid credentials/.test(msg))
    return "badCredentials";
  if (/already registered|already exists|user already/.test(msg)) return "emailInUse";
  if (/email not confirmed|confirm your email/.test(msg)) return "emailNotConfirmed";
  if (/password.*(short|least|weak)|weak password/.test(msg)) return "weakPassword";

  // Connectivity: a dropped mobile connection is the common real-world case.
  if (
    /failed to fetch|networkerror|network request failed|load failed|timeout|timed out|offline/.test(
      msg,
    )
  )
    return "network";

  if (status === 429 || /rate limit|too many requests/.test(msg)) return "rate";
  if (
    status === 401 ||
    status === 403 ||
    /row-level security|not authorized|unauthorized|forbidden|permission/.test(msg)
  )
    return "permission";
  if (status === 404 || /not found|introuvable/.test(msg)) return "notFound";
  if (
    (status !== null && status >= 500) ||
    /^ai 5\d\d|internal server|bad gateway|service unavailable/.test(msg)
  )
    return "server";

  return "generic";
}
