import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Camera, ScanText, Lightbulb } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const stepIcons = [Camera, ScanText, Lightbulb];

/**
 * The "How it works" steps as a calm, swipeable carousel. On mobile one card
 * fills the view and can be swiped, with pagination dots. On desktop the three
 * cards sit side by side, so no scrolling is needed. Content and copy are
 * unchanged; only the presentation of this section is new.
 */
export function HowItWorksCarousel() {
  const { raw } = useI18n();
  const steps = raw((d) => d.how.steps);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    containScroll: "trimSnaps",
  });
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setSnaps(emblaApi.scrollSnapList());
      setSelected(emblaApi.selectedScrollSnap());
    };
    sync();
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    // Animate the section in once. Per-card whileInView is wrong here: a
    // carousel slide lives translated out of the viewport, so its intersection
    // observer would never fire and the card would stay invisible until swiped.
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Spacing via negative margin + padding rather than gap: embla measures
            slide offsets, and CSS gap throws off its snap translation. */}
        <div className="-ml-4 flex touch-pan-y items-stretch sm:-ml-5">
          {steps.map((s, i) => {
            const Icon = stepIcons[i] ?? Lightbulb;
            const active = i === selected;
            return (
              <div key={i} className="min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/3 sm:pl-5">
                <article
                  className={[
                    "flex h-full flex-col items-center rounded-[2rem] border bg-surface px-7 py-10 text-center transition-colors duration-500 sm:px-6 sm:py-12",
                    active ? "border-border-strong" : "border-border",
                  ].join(" ")}
                >
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[1.25rem] bg-emerald-soft">
                    <Icon className="h-8 w-8 text-emerald" strokeWidth={1.75} />
                  </div>
                  <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
                    {`0${i + 1}`}
                  </div>
                  <h3 className="mt-3 text-[22px] font-bold tracking-tight text-foreground">
                    {s.t}
                  </h3>
                  <p className="mt-3 max-w-[16rem] text-[15px] leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots — swipe target lives on mobile, where the cards page. */}
      <div className="mt-7 flex items-center justify-center gap-2 sm:hidden">
        {snaps.map((_, i) => {
          const active = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Step ${i + 1}`}
              aria-current={active}
              className={[
                "h-2 rounded-full transition-all duration-300",
                active ? "w-6 bg-emerald" : "w-2 bg-border-strong",
              ].join(" ")}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
