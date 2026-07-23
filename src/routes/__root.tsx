import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { redeemReferralCode } from "@/lib/referral.functions";
import { takePendingReferral } from "@/lib/pending-referral";
import "@/i18n";
import { getLocale } from "@/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page drifted off. Head back and start a new lesson.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again — if it keeps failing, head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Go home
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
      { title: "Forma AI — Learn Better with AI" },
      {
        name: "description",
        content:
          "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step answers, and personalized learning support.",
      },
      { property: "og:title", content: "Forma AI — Learn Better with AI" },
      {
        property: "og:description",
        content:
          "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step answers, and personalized learning support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Forma AI — Learn Better with AI" },
      { name: "twitter:description", content: "Forma AI helps students understand courses and exercises with AI-powered explanations, step-by-step answers, and personalized learning support." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f3f813f2-97bb-4b5b-841e-23e5fcd7d875/id-preview-23442503--ff20e900-72ee-46ea-af34-54249137d40e.lovable.app-1784588761722.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f3f813f2-97bb-4b5b-841e-23e5fcd7d875/id-preview-23442503--ff20e900-72ee-46ea-af34-54249137d40e.lovable.app-1784588761722.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.jpg", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.jpg" },
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

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;

      // A referral code typed at sign-up can only be redeemed now: this is the
      // first moment a session exists, whether the user arrived from an OAuth
      // redirect or an email confirmation link. Redeeming is optional, so a
      // failure must never interrupt the sign-in it follows.
      if (event === "SIGNED_IN") {
        const code = takePendingReferral();
        if (code) {
          Promise.resolve(redeem({ data: { code } }))
            .then(() => queryClient.invalidateQueries({ queryKey: ["referral"] }))
            .catch((e) => console.error("[referral] redemption failed", e));
        }
      }

      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient, redeem]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
