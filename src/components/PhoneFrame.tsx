/**
 * The device the landing's two stories are told on.
 *
 * Shared rather than copied. Both sections depend on the frame being *the same
 * frame* - that is what makes the lesson, the other tool and Forma read as one
 * world instead of three illustrations - and two copies of a bezel drift apart
 * the first time either is touched.
 */

export const SCREEN_W = 158;
export const SCREEN_H = 316;

export function Phone({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "relative rounded-[28px] border p-[7px] shadow-[var(--shadow-lift)]",
        dark ? "border-neutral-700/70 bg-neutral-800" : "border-border-strong/40 bg-surface-muted",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[22px]",
          dark ? "bg-neutral-900" : "bg-card",
        ].join(" ")}
        style={{ width: SCREEN_W, height: SCREEN_H }}
      >
        {/* The pill. Small, and it does most of the recognising. */}
        <span
          className={[
            "absolute left-1/2 top-[7px] z-10 h-[5px] w-[38px] -translate-x-1/2 rounded-full",
            dark ? "bg-neutral-700" : "bg-border-strong/45",
          ].join(" ")}
        />
        {children}
      </div>
    </div>
  );
}
