import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Six-character A-Z0-9 code that avoids visually confusable characters.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

// Ensures the current user has a referral profile with a unique code. Idempotent.
export const ensureReferralProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("referral_profiles")
      .select("code, referred_by, premium_unlocked")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) return existing;

    for (let i = 0; i < 6; i++) {
      const code = newCode();
      const { error } = await context.supabase.from("referral_profiles").insert({
        user_id: context.userId,
        code,
      });
      if (!error) return { code, referred_by: null, premium_unlocked: false };
    }
    throw new Error("Could not allocate referral code");
  });

// Apply a referral code entered at signup. Safe to call multiple times; only
// the first successful call sticks (referred_by is set once).
export const applyReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ code: z.string().trim().min(4).max(12) }).parse(raw))
  .handler(async ({ data, context }) => {
    const normalized = data.code.toUpperCase();
    const { data: refUser, error: lookupErr } = await context.supabase.rpc(
      "get_referrer_by_code",
      { _code: normalized },
    );
    if (lookupErr) throw lookupErr;
    if (!refUser) return { ok: false, reason: "not_found" as const };
    if (refUser === context.userId) return { ok: false, reason: "self" as const };

    // Make sure the caller has a profile first.
    const { data: mine } = await context.supabase
      .from("referral_profiles")
      .select("referred_by")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!mine) {
      await context.supabase.from("referral_profiles").insert({
        user_id: context.userId,
        code: newCode(),
        referred_by: refUser,
      });
    } else if (!mine.referred_by) {
      await context.supabase
        .from("referral_profiles")
        .update({ referred_by: refUser })
        .eq("user_id", context.userId);
    } else {
      return { ok: false, reason: "already" as const };
    }

    // Check if the referrer just crossed the 3-referral threshold.
    const { count } = await context.supabase
      .from("referral_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("referred_by", refUser);
    if ((count ?? 0) >= 3) {
      await context.supabase
        .from("referral_profiles")
        .update({ premium_unlocked: true })
        .eq("user_id", refUser);
    }
    return { ok: true as const };
  });

export const myReferralStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("referral_profiles")
      .select("code, premium_unlocked")
      .eq("user_id", context.userId)
      .maybeSingle();
    const { data: count } = await context.supabase.rpc("my_referral_count");
    return {
      code: profile?.code ?? null,
      premium_unlocked: profile?.premium_unlocked ?? false,
      invited: (count as number | null) ?? 0,
      threshold: 3,
    };
  });
