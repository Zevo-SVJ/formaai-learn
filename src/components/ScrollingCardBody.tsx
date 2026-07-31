import { useEffect, useRef, useState } from "react";

/**
 * The text of a card inside a fixed frame.
 *
 * The deck keeps every card exactly the same size, so a long explanation has to
 * scroll on its own rather than stretch the card. A soft fade sits at the
 * bottom while there is more to read, so a paragraph cut mid-sentence never
 * looks like the end of the text, and `overscroll-contain` keeps the page still
 * while a card is being read.
 */
export function ScrollingCardBody({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    update();
    el.addEventListener("scroll", update, { passive: true });
    // The text reflows when the web fonts land, which changes whether there is
    // anything left to read.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      {/* The scrollbar is hidden on purpose: the fade already says there is more
          to read, and a chrome scrollbar running through a card breaks the
          object. */}
      <div
        ref={ref}
        data-scroller
        className="h-full space-y-2 overflow-y-auto overscroll-contain text-[15px] leading-relaxed text-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div
        data-fade
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent transition-opacity duration-200"
        style={{ opacity: more ? 1 : 0 }}
      />
    </div>
  );
}
