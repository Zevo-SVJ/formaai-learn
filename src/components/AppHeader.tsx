import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { LogOut, Home as HomeIcon, BookOpen, TrendingUp } from "lucide-react";

export function AppHeader({ back }: { back?: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const NavLink = ({
    to,
    icon: Icon,
    label,
  }: {
    to: "/home" | "/library" | "/progress";
    icon: typeof HomeIcon;
    label: string;
  }) => {
    const active = path === to || path.startsWith(to + "/");
    return (
      <Link
        to={to}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
          active
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {back}
          <Link to="/home" className="shrink-0">
            <Logo />
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/home" icon={HomeIcon} label={t((d) => d.common.home)} />
          <NavLink to="/library" icon={BookOpen} label={t((d) => d.common.library)} />
          <NavLink to="/progress" icon={TrendingUp} label={t((d) => d.progress.nav)} />
        </nav>
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
