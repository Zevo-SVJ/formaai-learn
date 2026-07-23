import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { analyzeDocument } from "@/lib/documents.functions";
import { useI18n } from "@/hooks/useI18n";

const MAX_MB = 20;

export function useLessonUpload() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeDocument);
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(t((d) => d.upload.fileTooLarge, { max: MAX_MB }));
        return;
      }
      // Resolving the session must never take the upload down with it.
      // getUser() rejects instead of returning an error for anything that is
      // not an AuthError, and on Android Chrome with site data blocked the
      // localStorage read behind it throws SecurityError. Treat any failure as
      // signed out - which is the truth when storage is unavailable anyway.
      let user: User | null = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        user = userData.user;
      } catch (e) {
        console.error("[upload] could not resolve the session", e);
      }

      if (!user) {
        // No analysis runs from the landing. Clicking upload is a transition
        // into onboarding, which personalizes the tutor first; sign-up happens
        // at the end of onboarding. The onboarding route opens on a short intro
        // screen that explains why the questions exist.
        navigate({ to: "/onboarding" });
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

        setBusy(t((d) => d.upload.reading));
        analyze({ data: { documentId: row.id } }).catch(async (e) => {
          console.error(e);
          // If the request never reached the server - a dropped mobile
          // connection is the usual reason - the server side cannot mark the
          // row, so it would keep its "extracting" status and the document
          // page would poll it forever with no retry button. Only touch rows
          // still mid-flight, so a result that did land is never clobbered.
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

  return { handleFile, busy };
}
