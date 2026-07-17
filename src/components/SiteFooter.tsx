import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/hooks/useI18n";

const INSTAGRAM_URL =
  "https://www.instagram.com/zevo.flcs?igsh=dGU2b29uYjYzN2Rt&utm_source=qr";
const CONTACT_EMAIL = "zevo.flcs@gmail.com";

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
          <Link to="/privacy" className="hover:text-foreground">
            {t((d) => d.footer.privacy)}
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            {t((d) => d.footer.terms)}
          </Link>
          <Link to="/cookies" className="hover:text-foreground">
            {t((d) => d.footer.cookies)}
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            aria-label={CONTACT_EMAIL}
          >
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
          <LanguageSwitcher variant="ghost" />
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Forma AI. {t((d) => d.footer.rights)}
      </div>
    </footer>
  );
}
