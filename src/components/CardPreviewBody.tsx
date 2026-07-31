import { useEffect, useRef, useState } from "react";

/**
 * The text of a card inside the deck's fixed frame.
 *
 * It does not scroll. A card in the deck is a preview of what it holds — the
 * whole of it is read by opening it — and a scroller here would be a second
 * claim on the vertical gesture, competing with the page behind and with the
 * sideways swipe that moves the deck. Removing it is what makes the swipe
 * dependable.
 *
 * What is left is the honest signal: when there is more text than fits, it
 * fades out at the bottom rather than stopping mid-sentence at a hard edge.
 */
export function CardPreviewBody({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    update();
    // The text reflows when the web fonts land and when the device rotates,
    // either of which changes whether anything is cut off.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => ro?.disconnect();
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={ref}
        data-preview
        className="h-full space-y-2 overflow-hidden text-[15px] leading-relaxed text-foreground"
      >
        {children}
      </div>
      <div
        data-fade
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent transition-opacity duration-200"
        style={{ opacity: overflows ? 1 : 0 }}
      />
    </div>
  );
}
