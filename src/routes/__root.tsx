import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { redeemReferralCode } from "@/lib/referral.functions";
import { takePendingReferral } from "@/lib/pending-referral";
import "@/i18n";
import { getLocale } from "@/i18n";
import { useI18n } from "@/hooks/useI18n";
import { initAnalytics, track } from "@/lib/analytics";
import { applySiteMeta, socialMeta } from "@/lib/seo";
import { flushPendingOnboarding } from "@/lib/account";
import { ConsentBanner } from "@/components/ConsentBanner";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-[15px] font-semibold text-foreground">
          {t((d) => d.errorPages.notFound.title)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t((d) => d.errorPages.notFound.body)}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            {t((d) => d.errorPages.notFound.home)}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t((d) => d.errorPages.crash.title)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t((d) => d.errorPages.crash.body)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t((d) => d.errorPages.crash.retry)}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-border-strong"
          >
            {t((d) => d.errorPages.crash.home)}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f7f5ef" },
      // Proves ownership of the site to Google Search Console. It lives in the
      // root head so it is present on every page, which is what the check needs.
      // Only one entry is possible: TanStack merges head meta by `name`, so a
      // second google-site-verification would silently replace this one rather
      // than sit beside it. Verifying another property needs a different method
      // (DNS record or HTML file).
      {
        name: "google-site-verification",
        content: "2UVgvSV78rkNTjwChAR6q-7CmhiNwTFVey3Bx0tYtWc",
      },
      { title: "Forma AI — AI Study Assistant for Students" },
      {
        name: "description",
        content:
          "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step solutions, and smarter study tools.",
      },

      // Everything a link preview needs, from the one module that declares it.
      ...socialMeta(),

      // Google may show a full-width thumbnail rather than a favicon, which is
      // what makes Discover and image-rich results possible at all.
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "application-name", content: "Forma AI" },
      { name: "apple-mobile-web-app-title", content: "Forma" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // The type has to match the file. It claimed image/x-icon for a JPEG,
      // which some crawlers and older browsers take at face value and then
      // fail to decode.
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
      // iOS ignores the manifest for the home-screen icon and reads this.
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const redeem = useServerFn(redeemReferralCode);

  // The shell is server-rendered with lang="en". Once hydrated, reflect the
  // actually active locale (auto-detected from the browser or a saved
  // preference) on <html lang> for accessibility and SEO. Running this in an
  // effect keeps it out of hydration, so it never causes a mismatch.
  useEffect(() => {
    document.documentElement.setAttribute("lang", getLocale());
  }, []);

  // The same reasoning, applied to the title and description. Only the landing
  // page gets them: every other route sets a title of its own, and overwriting
  // those with the site-level one would make the tab say "Forma AI" while the
  // student is on their library. Depending on the resolved strings rather than
  // on `t` keeps this to one run per language change.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const seoTitle = t((d) => d.seo.title);
  const seoDescription = t((d) => d.seo.description);
  useEffect(() => {
    if (pathname !== "/") return;
    applySiteMeta({ title: seoTitle, description: seoDescription });
  }, [pathname, seoTitle, seoDescription]);

  // Analytics loads after hydration and stays inert unless a measurement id is
  // configured, so it never affects first paint.
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;

      // A referral code typed at sign-up can only be redeemed now: this is the
      // first moment a session exists, whether the user arrived from an OAuth
      // redirect or an email confirmation link. Redeeming is optional, so a
      // failure must never interrupt the sign-in it follows.
      if (event === "SIGNED_IN") {
        // Sign-up is reported here rather than in the auth form: OAuth is a
        // full-page redirect, so nothing after signInWithOAuth() ever runs and
        // Google/Apple sign-ups were invisible. This is the first moment a
        // session exists for every method. A freshly created account is one
        // whose creation is seconds old; the guard keeps it to once per user.
        void supabase.auth.getUser().then(({ data }) => {
          const u = data.user;
          if (!u?.created_at) return;
          const ageMs = Date.now() - new Date(u.created_at).getTime();
          if (ageMs > 5 * 60_000) return;
          try {
            const key = `forma:signupTracked:${u.id}`;
            if (window.localStorage.getItem(key)) return;
            window.localStorage.setItem(key, "1");
          } catch {
            // Without storage we may report twice; better than never.
          }
          track("account_created");
        });

        // Onboarding runs before sign-up, so this is the first moment its
        // answers have an owner. Until it lands, the only record is in this
        // browser - which is the whole problem being fixed.
        void flushPendingOnboarding().then((wrote) => {
          if (wrote) queryClient.invalidateQueries({ queryKey: ["account"] });
        });

        const code = takePendingReferral();
        if (code) {
          Promise.resolve(redeem({ data: { code } }))
            .then(() => queryClient.invalidateQueries({ queryKey: ["referral"] }))
            .catch((e) => console.error("[referral] redemption failed", e));
        }
      }

      router.invalidate();
      queryClient.invalidateQueries({ queryKey: ["account"] });
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient, redeem]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS "reduce motion" setting across every framer animation,
          without touching layout for everyone else. */}
      <MotionConfig reducedMotion="user">
        <Outlet />
        <ConsentBanner />
        <Toaster richColors position="top-center" />
      </MotionConfig>
    </QueryClientProvider>
  );
}
