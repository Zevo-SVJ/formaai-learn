import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, Camera, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDocument } from "@/lib/documents.functions";
import { toast } from "sonner";
import { useI18n } from "@/hooks/useI18n";

const ACCEPT = "image/*,application/pdf,.txt,.md";
const MAX_MB = 20;

export function UploadArea({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeDocument);
  const { t, locale } = useI18n();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFr = locale.startsWith("fr");

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(isFr ? `Fichier trop lourd. Max ${MAX_MB} Mo.` : `File too large. Max ${MAX_MB} MB.`);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        sessionStorage.setItem("forma:pendingUpload", "1");
        navigate({ to: "/auth" });
        return;
      }
      const userId = userData.user.id;
      try {
        setBusy(isFr ? "Envoi" : "Uploading");
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;

        const { data: row, error: insErr } = await supabase
          .from("documents")
          .insert({
            user_id: userId,
            title: file.name.replace(/\.[^.]+$/, ""),
            storage_path: path,
            mime: file.type || "application/octet-stream",
            size: file.size,
            status: "extracting",
          })
          .select("id")
          .single();
        if (insErr || !row) throw insErr ?? new Error("insert failed");

        setBusy(isFr ? "Lecture du document" : "Reading your document");
        analyze({ data: { documentId: row.id } }).catch((e) => {
          console.error(e);
          toast.error(isFr ? "L'analyse a échoué. Ouvre le document pour réessayer." : "Analysis failed. Open the document to retry.");
        });
        navigate({ to: "/doc/$docId", params: { docId: row.id } });
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : isFr ? "Envoi impossible" : "Upload failed");
      } finally {
        setBusy(null);
      }
    },
    [analyze, navigate, isFr],
  );

  // Listen for global upload events (e.g. from Home quick actions).
  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent<File>).detail;
      if (detail instanceof File) handleFile(detail);
    };
    window.addEventListener("forma:uploadFile", onEvt as EventListener);
    return () => window.removeEventListener("forma:uploadFile", onEvt as EventListener);
  }, [handleFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="forma-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold hover:-translate-y-0.5"
      >
        <Upload className="h-4 w-4" />
        {isFr ? "Déposer une leçon" : "Upload a lesson"}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </button>
    );
  }

  const title = busy ?? (isFr ? "Dépose ta leçon ici" : "Drop your lesson here");
  const sub = isFr
    ? "Leçon, devoir, capture, photo, PDF ou fiche. Forma lit et t'explique."
    : "Lesson, homework, screenshot, photo, PDF or worksheet. Forma AI reads it and explains it.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !busy && inputRef.current?.click()}
      className={[
        "group relative mx-auto w-full max-w-2xl cursor-pointer overflow-hidden rounded-[2rem] border p-6 sm:p-10",
        "bg-surface transition-all duration-300",
        dragging
          ? "border-emerald shadow-[var(--shadow-emerald)] scale-[1.01]"
          : "border-border-strong shadow-[var(--shadow-lift)] hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, var(--color-emerald-soft) 0%, transparent 70%)",
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-soft">
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-emerald" />
          ) : (
            <Upload className="h-7 w-7 text-emerald" strokeWidth={2.25} />
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-[15px]">
          {sub}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <FileText className="h-3.5 w-3.5" /> PDF
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Image
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <Camera className="h-3.5 w-3.5" /> {isFr ? "Photo" : "Photo"}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="forma-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <Upload className="h-4 w-4" strokeWidth={2.4} />
            {isFr ? "Choisir un fichier" : "Choose a file"}
          </span>
          <span className="text-xs text-muted-foreground">
            {isFr ? "ou glisse-dépose" : "or drag and drop"}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{t((d) => d.hero.ctaHint)}</p>
      </div>
    </motion.div>
  );
}
