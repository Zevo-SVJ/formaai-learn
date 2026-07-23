import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Eye, EyeOff, Ticket } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { storePendingReferral } from "@/lib/pending-referral";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Forma AI" },
      { name: "description", content: "Sign in to Forma AI." },
    ],
  }),
  component: Auth,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.8h5.4c-.24 1.3-1.7 3.8-5.4 3.8-3.24 0-5.9-2.7-5.9-6s2.66-6 5.9-6c1.86 0 3.1.8 3.8 1.48l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.94 0 9.2-4.86 9.2-8.34 0-.56-.06-1-.14-1.44H12z"
      />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.464 2.23-1.226 3.03-.82.86-2.14 1.53-3.24 1.44-.14-1.1.44-2.24 1.19-2.99.85-.85 2.27-1.5 3.28-1.48zM20.06 17.6c-.55 1.27-.82 1.83-1.53 2.94-1 1.55-2.4 3.48-4.14 3.5-1.55.01-1.95-1.02-4.06-1.01-2.11.01-2.55 1.03-4.11 1.02-1.74-.02-3.06-1.76-4.06-3.31-2.8-4.36-3.09-9.48-1.36-12.2 1.22-1.92 3.15-3.05 4.96-3.05 1.85 0 3.02 1.02 4.55 1.02 1.48 0 2.39-1.02 4.53-1.02 1.62 0 3.34.88 4.57 2.4-4.02 2.2-3.37 7.94.65 9.71z" />
    </svg>
  );
}

function Auth() {
  const navigate = useNavigate();
  const { t } = useI18n();

  // If onboarding completed, default to signup; otherwise sign in.
  const initialMode: "signup" | "signin" = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup") return "signup";
      if (params.get("mode") === "signin") return "signin";
      return window.localStorage.getItem("forma:onboarded") === "1" ? "signup" : "signin";
    } catch {
      return "signin";
    }
  })();

  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<string | null>(null);

  // If already signed in, send to /home (onboarded) or /onboarding otherwise.
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) return;
        const onboarded = (() => {
          try {
            return window.localStorage.getItem("forma:onboarded") === "1";
          } catch {
            return true;
          }
        })();
        navigate({ to: onboarded ? "/home" : "/onboarding" });
      })
      // Leaving this rejection unhandled would strand the visitor on a sign-in
      // form that never reacts. Staying put is the right fallback: the form
      // below still works.
      .catch((e) => console.error("[auth] session check failed", e));
  }, [navigate]);

  const oauth = async (p: "google" | "apple") => {
    setLoadingOAuth(p);
    // Park the code before leaving the page: on a published site OAuth is a
    // full-page redirect, so nothing after this call runs.
    if (mode === "signup" && referral.trim()) storePendingReferral(referral);
    const res = await lovable.auth.signInWithOAuth(p, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) {
      toast.error(res.error.message || t((d) => d.auth.signInFailed));
      setLoadingOAuth(null);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/home" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/home" },
        });
        if (error) throw error;
        // Redemption needs a session. With email confirmation enabled signUp
        // returns none, so park the code and let the SIGNED_IN handler redeem
        // it once the user comes back through the confirmation link.
        if (referral.trim()) storePendingReferral(referral);
        if (!data.session) {
          toast.success(t((d) => d.auth.checkInboxConfirm));
          setSubmitting(false);
          return;
        }
        navigate({ to: "/home" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t((d) => d.auth.signInFailed));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto flex max-w-md flex-col px-5 pt-6 sm:pt-10">
        <div className="mb-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t((d) => d.common.back)}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <Logo size={40} withWordmark={false} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {mode === "signup"
              ? t((d) => d.auth.createAccount)
              : t((d) => d.auth.welcome)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? t((d) => d.auth.createTagline)
              : t((d) => d.auth.tagline)}
          </p>
        </motion.div>

        {/* Mode switch */}
        <div className="mx-auto mt-8 inline-flex rounded-full border border-border bg-surface p-0.5 self-center">
          {(["signup", "signin"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                mode === m ? "bg-foreground text-background" : "text-muted-foreground",
              ].join(" ")}
            >
              {m === "signup" ? t((d) => d.auth.tabSignup) : t((d) => d.auth.tabSignin)}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => oauth("google")}
            disabled={!!loadingOAuth}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-3.5 text-[15px] font-semibold text-foreground transition hover:border-border-strong disabled:opacity-60"
          >
            {loadingOAuth === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            {t((d) => d.auth.google)}
          </button>
          <button
            onClick={() => oauth("apple")}
            disabled={!!loadingOAuth}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-foreground py-3.5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loadingOAuth === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
            {t((d) => d.auth.apple)}
          </button>

          <div className="flex items-center gap-3 py-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t((d) => d.common.or)}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-2.5">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t((d) => d.auth.emailPlaceholder)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t((d) => d.auth.passwordPlaceholder)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 pr-11 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide" : "Show"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Ticket className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={referral}
                      onChange={(e) => setReferral(e.target.value.toUpperCase())}
                      placeholder={t((d) => d.auth.referralPlaceholder)}
                      maxLength={12}
                      className="w-full rounded-2xl border border-border bg-surface px-4 py-3 pl-11 text-[15px] tracking-widest outline-none placeholder:text-muted-foreground placeholder:tracking-normal focus:border-emerald"
                    />
                  </div>
                  <p className="mt-1.5 px-1 text-[11.5px] text-muted-foreground">
                    {t((d) => d.auth.referralHint)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? t((d) => d.auth.createCta) : t((d) => d.auth.signinCta)}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">{t((d) => d.auth.terms)}</p>
      </div>
    </div>
  );
}
