import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/hooks/useI18n";
import { LogOut, Home as HomeIcon, BookOpen, LineChart } from "lucide-react";

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
          "inline-flex min-h-[40px] items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-tight transition-colors",
          active
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {back}
          {/* -m-2 p-2 enlarges the tap area to ~44px around the 28px logo
              without changing the layout (the negative margin cancels the
              padding). */}
          <Link to="/home" className="-m-2 flex shrink-0 items-center p-2">
            <Logo />
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/home" icon={HomeIcon} label={t((d) => d.common.home)} />
          <NavLink to="/library" icon={BookOpen} label={t((d) => d.common.library)} />
          <NavLink to="/progress" icon={LineChart} label={t((d) => d.progress.nav)} />
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold tracking-tight text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label={t((d) => d.common.signOut)}
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">{t((d) => d.common.signOut)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
