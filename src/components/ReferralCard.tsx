import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Copy, Check, Gift, Share2 } from "lucide-react";
import { toast } from "sonner";
import { getMyReferral } from "@/lib/referral.functions";
import { useI18n } from "@/hooks/useI18n";

export function ReferralCard() {
  const { t } = useI18n();
  const get = useServerFn(getMyReferral);
  const { data } = useQuery({
    queryKey: ["referral"],
    queryFn: () => get() as Promise<{ code: string; referrals: number; target: number; premiumUnlocked: boolean }>,
  });
  const [copied, setCopied] = useState(false);

  const code = data?.code ?? "……";
  const referrals = data?.referrals ?? 0;
  const target = data?.target ?? 3;
  const unlocked = data?.premiumUnlocked ?? false;
  const pct = Math.min(100, Math.round((referrals / target) * 100));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t((d) => d.referral.copied));
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t((d) => d.referral.copyFailed));
    }
  };

  const share = async () => {
    const text = t((d) => d.referral.shareBody, { code });
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Forma AI",
          text,
          url: typeof window !== "undefined" ? window.location.origin : undefined,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    await copy();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--color-emerald-soft)" }}
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald text-white">
          <Gift className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald">
            {unlocked ? t((d) => d.referral.unlockedEyebrow) : t((d) => d.referral.eyebrow)}
          </div>
          <div className="mt-0.5 text-[17px] font-bold leading-snug text-foreground">
            {unlocked ? t((d) => d.referral.unlockedTitle) : t((d) => d.referral.title)}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {unlocked ? t((d) => d.referral.unlockedBody) : t((d) => d.referral.body)}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={copy}
          className="group flex flex-1 items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-left transition hover:border-emerald"
          aria-label={t((d) => d.referral.copy)}
        >
          <div className="flex flex-col leading-tight">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t((d) => d.referral.yourCode)}
            </span>
            <span className="mt-0.5 font-mono text-[20px] font-bold tracking-[0.24em] text-foreground">
              {code}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition group-hover:border-emerald group-hover:text-emerald">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </span>
        </button>
        <button
          onClick={share}
          className="forma-shine inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-[14px] font-semibold text-background sm:w-auto"
        >
          <Share2 className="h-4 w-4" />
          {t((d) => d.referral.share)}
        </button>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center justify-between text-[11.5px] font-semibold text-muted-foreground">
          <span>
            {referrals} / {target} {t((d) => d.referral.friends)}
          </span>
          <span className="text-emerald">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-emerald"
          />
        </div>
      </div>
    </motion.div>
  );
}
