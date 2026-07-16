import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/hooks/useI18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo size={22} />
          <p className="text-xs text-muted-foreground">{t((d) => d.footer.tagline)}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground">
            {t((d) => d.footer.terms)}
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            {t((d) => d.footer.privacy)}
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            {t((d) => d.footer.contact)}
          </Link>
          <LanguageSwitcher variant="ghost" />
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Forma AI. {t((d) => d.footer.rights)}
      </div>
    </footer>
  );
}
