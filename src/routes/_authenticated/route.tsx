import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getUser() rejects instead of returning an error for anything that is not
    // an AuthError - a Web Locks acquisition timeout is the common one, since
    // supabase-js serialises auth calls across tabs and gives up after 5s. A
    // rejection here escapes the route load and renders the root error
    // boundary, which is not what a signed-out visitor should ever see.
    // Treat any failure as "not signed in" and let /auth sort it out.
    let user: User | null = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch (e) {
      console.error("[auth] could not resolve the session", e);
    }

    // Thrown outside the try so the redirect is never swallowed by the catch.
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
