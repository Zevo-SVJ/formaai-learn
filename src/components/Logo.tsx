// The official Forma logo, bundled by Vite so it resolves in every
// environment. The remote asset URL in forma-logo.asset.json only serves
// from Lovable's host, so it 404s in local dev and on other deploys.
//
// 96px, because the largest this is ever drawn is 28 CSS pixels and the build
// preloads it: the original was a 658px, 28KB source fetched eagerly on every
// page to be painted into a 28px box. Same picture, a tenth of the bytes.
import logoUrl from "@/assets/forma-mark.jpg";

export function Logo({
  size = 28,
  withWordmark = true,
  withMark = true,
}: {
  size?: number;
  withWordmark?: boolean;
  /**
   * The square mark. Worth showing where Forma has to introduce itself — the
   * landing, the legal pages, a signed-out screen. Inside the app it sits next
   * to a wordmark that already says the same thing, so it is dropped there.
   */
  withMark?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 select-none">
      {withMark && (
        <img
          src={logoUrl}
          alt="Forma AI logo"
          width={size}
          height={size}
          className="rounded-md"
          style={{ width: size, height: size }}
        />
      )}
      {withWordmark && (
        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
          Forma <span className="text-emerald">AI</span>
        </span>
      )}
    </div>
  );
}
