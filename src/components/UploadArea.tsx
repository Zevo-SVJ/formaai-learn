import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Upload, Camera, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDocument } from "@/lib/documents.functions";
import { toast } from "sonner";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

const ACCEPT = "image/*,application/pdf,.txt,.md";
const MAX_MB = 20;

export function UploadArea({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeDocument);
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(t((d) => d.upload.fileTooLarge, { max: MAX_MB }));
        return;
      }
      // Same reasoning as useLessonUpload: getUser() rejects for anything that
      // is not an AuthError, and blocked storage makes both this call and the
      // marker below throw. Neither may stop the visitor being sent to /auth.
      let user: User | null = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        user = userData.user;
      } catch (e) {
        console.error("[upload] could not resolve the session", e);
      }
      if (!user) {
        try {
          sessionStorage.setItem("forma:pendingUpload", "1");
        } catch {
          // Losing the marker is fine; failing to navigate is not.
        }
        navigate({ to: "/auth" });
        return;
      }
      const userId = user.id;
      try {
        setBusy(t((d) => d.upload.uploading));
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

        setBusy(t((d) => d.upload.readingDoc));
        analyze({ data: { documentId: row.id } }).catch(async (e) => {
          console.error(e);
          // A request that never reached the server leaves the row mid-flight
          // and the document page polling forever, so close it out here. The
          // status filter keeps a result that did land from being clobbered.
          await supabase
            .from("documents")
            .update({ status: "failed", error: e instanceof Error ? e.message : String(e) })
            .eq("id", row.id)
            .in("status", ["uploading", "extracting", "analyzing"]);
          toast.error(t((d) => d.upload.analysisFailed));
        });
        navigate({ to: "/doc/$docId", params: { docId: row.id } });
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : t((d) => d.upload.uploadFailed));
      } finally {
        setBusy(null);
      }
    },
    [analyze, navigate, t],
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
        {t((d) => d.compact.upload)}
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

  const title = busy ?? t((d) => d.upload.dropHere);
  const sub = t((d) => d.upload.subtitle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, scale: dragging ? 1.01 : 1 }}
      whileHover={{ y: -2 }}
      transition={{
        duration: 0.5,
        ease: EASE.out,
        // Drag feedback stays snappy; the entrance stays calm.
        scale: { duration: 0.18, ease: EASE.out },
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !busy && inputRef.current?.click()}
      className={[
        "group relative mx-auto w-full max-w-2xl cursor-pointer overflow-hidden rounded-[2rem] border p-6 sm:p-10",
        // Colours/shadow only: framer owns transform + opacity here, so the CSS
        // transition must not also cover them or the entrance stutters.
        "bg-surface transition-[border-color,box-shadow] duration-300",
        dragging
          ? "border-emerald shadow-[var(--shadow-emerald)]"
          : "border-border-strong shadow-[var(--shadow-lift)]",
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
            <Camera className="h-3.5 w-3.5" /> {t((d) => d.upload.photo)}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="forma-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <Upload className="h-4 w-4" strokeWidth={2.4} />
            {t((d) => d.upload.chooseFile)}
          </span>
          <span className="text-xs text-muted-foreground">
            {t((d) => d.upload.orDragDrop)}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{t((d) => d.hero.ctaHint)}</p>
      </div>
    </motion.div>
  );
}
