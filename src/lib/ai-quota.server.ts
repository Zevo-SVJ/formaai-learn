// Per-user quota on the AI endpoints.
//
// The count lives in Postgres (see the ai_rate_limit migration) because Forma
// runs on Cloudflare Workers: every isolate has its own memory, so an in-process
// counter would reset constantly and protect nothing.
//
// Deliberate asymmetry:
//   - an explicit "false" from the database blocks the call (fail closed),
//   - an infrastructure error does NOT (fail open).
// The second case matters: this code can reach production before the migration
// does, and a missing function must never take the analysis and the tutor down
// for everyone. The failure is logged so it is visible rather than silent.

type QuotaKind = "analyze" | "chat";

/** Calls per rolling hour. Set well above normal study use. */
const LIMITS: Record<QuotaKind, { limit: number; windowSeconds: number }> = {
  // A student analysing a whole set of exercises still stays far below this.
  analyze: { limit: 30, windowSeconds: 3600 },
  // A long tutoring session is a few dozen questions at most.
  chat: { limit: 60, windowSeconds: 3600 },
};

type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};

/**
 * Records one AI call and reports whether it may proceed.
 * Returns true when allowed, false only when the quota is provably spent.
 *
 * The client arrives as `unknown` and is narrowed here: the generated Database
 * types enumerate the RPC functions that existed when they were last generated,
 * so a typed client rejects this one by name until the types are regenerated.
 */
export async function consumeAiQuota(supabase: unknown, kind: QuotaKind): Promise<boolean> {
  const client = supabase as RpcClient;
  const { limit, windowSeconds } = LIMITS[kind];
  try {
    const { data, error } = await client.rpc("consume_ai_quota", {
      _kind: kind,
      _limit: limit,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[quota] check failed, allowing the call", error);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("[quota] check threw, allowing the call", e);
    return true;
  }
}
