import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Camera, FileText, ImageIcon, ScanLine, Upload, X, Loader2 } from "lucide-react";
import { useLessonUpload } from "@/hooks/useLessonUpload";
import { useI18n } from "@/hooks/useI18n";

// Apple-style bottom action sheet on mobile, popover on desktop.
export function HeroActions() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { handleFile, busy } = useLessonUpload();
  const imgRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const scrollToHow = () => {
    const el = document.getElementById("how");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const options = [
    {
      id: "image",
      label: t((d) => d.hero.menu.image),
      icon: ImageIcon,
      onClick: () => imgRef.current?.click(),
    },
    {
      id: "pdf",
      label: t((d) => d.hero.menu.pdf),
      icon: FileText,
      onClick: () => pdfRef.current?.click(),
    },
    {
      id: "photo",
      label: t((d) => d.hero.menu.photo),
      icon: Camera,
      onClick: () => photoRef.current?.click(),
    },
    {
      id: "scan",
      label: t((d) => d.hero.menu.scan),
      icon: ScanLine,
      onClick: () => scanRef.current?.click(),
    },
  ];

  const onPick = async (file: File | undefined) => {
    setOpen(false);
    if (!file) return;
    await handleFile(file);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
      >
        <button
          onClick={() => !busy && setOpen(true)}
          className="forma-shine group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[15px] font-semibold text-background shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          disabled={!!busy}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" strokeWidth={2.4} />}
          {t((d) => d.hero.menu.upload)}
        </button>
        <button
          onClick={scrollToHow}
          className="forma-shine inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface px-6 py-3.5 text-[15px] font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground"
        >
          {t((d) => d.hero.menu.see)}
          <ArrowDown className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </motion.div>

      {/* Hidden file inputs — outside the sheet so they're always in the tree. */}
      <input ref={imgRef} type="file" accept="image/*" className="hidden"
             onChange={(e) => onPick(e.target.files?.[0] ?? undefined)} />
      <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
             onChange={(e) => onPick(e.target.files?.[0] ?? undefined)} />
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={(e) => onPick(e.target.files?.[0] ?? undefined)} />
      <input ref={scanRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={(e) => onPick(e.target.files?.[0] ?? undefined)} />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-sm"
            />
            <motion.div
              key="sheet"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md p-3 sm:inset-0 sm:my-auto sm:h-fit"
              role="dialog"
              aria-modal="true"
              aria-label={t((d) => d.hero.menu.title)}
            >
              <div className="overflow-hidden rounded-[28px] border border-border-strong bg-surface/95 shadow-[var(--shadow-lift)] backdrop-blur-xl">
                <div className="flex items-center justify-between px-5 pt-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t((d) => d.hero.menu.eyebrow)}
                    </div>
                    <div className="mt-0.5 text-[16px] font-bold text-foreground">
                      {t((d) => d.hero.menu.title)}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground"
                    aria-label={t((d) => d.common.close)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-1 p-2">
                  {options.map((o) => (
                    <button
                      key={o.id}
                      onClick={o.onClick}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald">
                        <o.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                      </span>
                      <span className="text-[15px] font-semibold text-foreground">{o.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-3 pt-1">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-2xl border border-border bg-surface-muted py-3 text-[14px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    {t((d) => d.common.close)}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
