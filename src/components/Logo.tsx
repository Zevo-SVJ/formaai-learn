// The official Forma logo, bundled by Vite so it resolves in every
// environment. The remote asset URL in forma-logo.asset.json only serves
// from Lovable's host, so it 404s in local dev and on other deploys.
import logoUrl from "@/assets/forma-logo.jpeg";

export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={logoUrl}
        alt="Forma AI logo"
        width={size}
        height={size}
        className="rounded-md"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
          Forma <span className="text-emerald">AI</span>
        </span>
      )}
    </div>
  );
}
