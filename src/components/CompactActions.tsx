import { useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Loader2 } from "lucide-react";
import { useLessonUpload } from "@/hooks/useLessonUpload";
import { useI18n } from "@/hooks/useI18n";

const ACCEPT = "image/*,application/pdf,.txt,.md";

export function CompactActions({ size = "md" }: { size?: "sm" | "md" }) {
  const { handleFile, busy } = useLessonUpload();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const pad = size === "sm" ? "px-4 py-2.5 text-[13.5px]" : "px-5 py-3 text-sm";
  const icon = size === "sm" ? "h-4 w-4" : "h-4.5 w-4.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center"
    >
      <button
        onClick={() => !busy && fileRef.current?.click()}
        className={`group inline-flex items-center justify-center gap-2 rounded-full bg-foreground font-semibold text-background shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 disabled:opacity-70 ${pad}`}
        disabled={!!busy}
      >
        {busy ? <Loader2 className={`${icon} animate-spin`} /> : <Upload className={icon} strokeWidth={2.25} />}
        {t((d) => d.compact.upload)}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </button>
      <button
        onClick={() => !busy && camRef.current?.click()}
        className={`group inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-emerald hover:text-emerald ${pad}`}
        disabled={!!busy}
      >
        <Camera className={icon} strokeWidth={2.25} />
        {t((d) => d.compact.scan)}
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </button>
    </motion.div>
  );
}
