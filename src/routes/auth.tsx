import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: Auth,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.8h5.4c-.24 1.3-1.7 3.8-5.4 3.8-3.24 0-5.9-2.7-5.9-6s2.66-6 5.9-6c1.86 0 3.1.8 3.8 1.48l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.94 0 9.2-4.86 9.2-8.34 0-.56-.06-1-.14-1.44H12z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.464 2.23-1.226 3.03-.82.86-2.14 1.53-3.24 1.44-.14-1.1.44-2.24 1.19-2.99.85-.85 2.27-1.5 3.28-1.48zM20.06 17.6c-.55 1.27-.82 1.83-1.53 2.94-1 1.55-2.4 3.48-4.14 3.5-1.55.01-1.95-1.02-4.06-1.01-2.11.01-2.55 1.03-4.11 1.02-1.74-.02-3.06-1.76-4.06-3.31-2.8-4.36-3.09-9.48-1.36-12.2 1.22-1.92 3.15-3.05 4.96-3.05 1.85 0 3.02 1.02 4.55 1.02 1.48 0 2.39-1.02 4.53-1.02 1.62 0 3.34.88 4.57 2.4-4.02 2.2-3.37 7.94.65 9.71z"/>
    </svg>
  );
}

function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<string | null>(null);

  // If already signed in, redirect.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/library" });
    });
  }, [navigate]);

  const oauth = async (p: "google" | "apple") => {
    setLoadingOAuth(p);
    const res = await lovable.auth.signInWithOAuth(p, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) {
      toast.error(res.error.message || "Sign-in failed");
      setLoadingOAuth(null);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/library" });
  };

  const sendMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/library" },
    });
    setSending(false);
    if (error) toast.error(error.message);
    else setSent(true);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto flex max-w-md flex-col px-5 pt-6 sm:pt-10">
        <Link to="/" className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <Logo size={40} withWordmark={false} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome to Forma AI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to start understanding your lessons.
          </p>
        </motion.div>

        <div className="mt-10 space-y-2.5">
          <button
            onClick={() => oauth("google")}
            disabled={!!loadingOAuth}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-3.5 text-[15px] font-semibold text-foreground transition hover:border-border-strong disabled:opacity-60"
          >
            {loadingOAuth === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            onClick={() => oauth("apple")}
            disabled={!!loadingOAuth}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-foreground py-3.5 text-[15px] font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loadingOAuth === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
            Continue with Apple
          </button>

          <div className="flex items-center gap-3 py-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {sent ? (
            <div className="rounded-2xl border border-border bg-emerald-soft/40 p-5 text-center">
              <Mail className="mx-auto h-5 w-5 text-emerald" />
              <p className="mt-2 text-sm font-semibold text-foreground">Check your inbox</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We sent a magic link to <span className="font-medium">{email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={sendMagic} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-emerald"
              />
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Continue with Email
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to Forma AI's terms and privacy notice.
        </p>
      </div>
    </div>
  );
}
