import logo from "@/assets/forma-logo.asset.json";

export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={logo.url}
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
