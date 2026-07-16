import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { LogOut } from "lucide-react";

export function AppHeader({ back }: { back?: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {back}
          <Link to="/home" className="shrink-0">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            aria-label={t((d) => d.common.signOut)}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t((d) => d.common.signOut)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
