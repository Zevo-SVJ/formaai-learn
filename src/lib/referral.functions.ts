import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const getMyReferral = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    let { data, error } = await supabase
      .from("referral_profiles")
      .select("code, referred_by, premium_unlocked")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Create with retry on collision
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = makeCode();
        const res = await supabase
          .from("referral_profiles")
          .insert({ user_id: userId, code })
          .select("code, referred_by, premium_unlocked")
          .single();
        if (!res.error) {
          data = res.data;
          break;
        }
      }
      if (!data) throw new Error("Could not create referral code");
    }

    const { count } = await supabase
      .from("referral_profiles")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", userId);
    const referrals = count ?? 0;

    // Auto-unlock at 3
    let premium = data.premium_unlocked;
    if (!premium && referrals >= 3) {
      await supabase
        .from("referral_profiles")
        .update({ premium_unlocked: true })
        .eq("user_id", userId);
      premium = true;
    }

    return {
      code: data.code,
      referredBy: data.referred_by,
      premiumUnlocked: premium,
      referrals,
      target: 3,
    };
  });

const RedeemInput = z.object({ code: z.string().min(3).max(12) });

export const redeemReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RedeemInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const code = data.code.trim().toUpperCase();

    // Ensure own row exists
    const existing = await supabase
      .from("referral_profiles")
      .select("user_id, referred_by")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data?.referred_by) {
      return { ok: false, reason: "already_redeemed" as const };
    }

    const { data: referrer } = await supabase.rpc("get_referrer_by_code", { _code: code });
    if (!referrer || referrer === userId) {
      return { ok: false, reason: "invalid" as const };
    }

    if (!existing.data) {
      // Create own row with referred_by set
      let ok = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const c = (() => {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          let s = "";
          for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
          return s;
        })();
        const res = await supabase
          .from("referral_profiles")
          .insert({ user_id: userId, code: c, referred_by: referrer as string });
        if (!res.error) {
          ok = true;
          break;
        }
      }
      if (!ok) throw new Error("Could not save referral");
    } else {
      const { error } = await supabase
        .from("referral_profiles")
        .update({ referred_by: referrer as string })
        .eq("user_id", userId);
      if (error) throw error;
    }

    return { ok: true as const };
  });
