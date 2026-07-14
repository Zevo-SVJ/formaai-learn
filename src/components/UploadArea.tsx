import { useCallback, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, Camera, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDocument } from "@/lib/documents.functions";
import { toast } from "sonner";

const ACCEPT = "image/*,application/pdf,.txt,.md";
const MAX_MB = 20;

export function UploadArea({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeDocument);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`File too large — max ${MAX_MB} MB`);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Save pending file? Simpler: send to auth with intent.
        sessionStorage.setItem("forma:pendingUpload", "1");
        navigate({ to: "/auth" });
        return;
      }
      const userId = userData.user.id;
      try {
        setBusy("Uploading");
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

        setBusy("Reading your document");
        // Kick off analysis, but navigate immediately so user sees progress.
        analyze({ data: { documentId: row.id } }).catch((e) => {
          console.error(e);
          toast.error("Analysis failed. Open the document to retry.");
        });
        navigate({ to: "/doc/$docId", params: { docId: row.id } });
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(null);
      }
    },
    [analyze, navigate],
  );

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
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
      >
        <Upload className="h-4 w-4" /> Upload a lesson
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
        "group relative mx-auto w-full max-w-2xl cursor-pointer rounded-[2rem] border p-6 sm:p-10",
        "bg-surface transition-all duration-300",
        dragging
          ? "border-emerald shadow-[var(--shadow-emerald)] scale-[1.01]"
          : "border-border-strong shadow-[var(--shadow-lift)] hover:-translate-y-0.5",
      ].join(" ")}
      style={{ boxShadow: dragging ? undefined : "var(--shadow-lift)" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-soft">
          {busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-emerald" />
          ) : (
            <Upload className="h-7 w-7 text-emerald" strokeWidth={2.25} />
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {busy ?? "Drop your lesson here"}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-[15px]">
          Lesson, homework, screenshot, photo, PDF or worksheet. Forma AI reads it and explains it.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <FileText className="h-3.5 w-3.5" /> PDF
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Image
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <Camera className="h-3.5 w-3.5" /> Photo
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
            Choose a file
          </span>
          <span className="text-xs text-muted-foreground">or drag &amp; drop</span>
        </div>
      </div>
    </motion.div>
  );
}
