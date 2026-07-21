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
  const { locale } = useI18n();
  const isFr = locale.startsWith("fr");
  const [busy, setBusy] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(isFr ? `Fichier trop lourd. Max ${MAX_MB} Mo.` : `File too large. Max ${MAX_MB} MB.`);
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
        // New flow: Landing → Onboarding → Auth → App.
        try {
          sessionStorage.setItem("forma:pendingUpload", "1");
        } catch {
          // Losing this marker is acceptable; failing to send the visitor
          // onward is not, so it must not sit between here and navigate().
        }
        const onboarded = (() => {
          try {
            return window.localStorage.getItem("forma:onboarded") === "1";
          } catch {
            return false;
          }
        })();
        navigate({ to: onboarded ? "/auth" : "/onboarding" });
        return;
      }
      const userId = user.id;
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

        setBusy(isFr ? "Lecture" : "Reading");
        analyze({ data: { documentId: row.id } }).catch((e) => {
          console.error(e);
          toast.error(
            isFr
              ? "L'analyse a échoué. Ouvre le document pour réessayer."
              : "Analysis failed. Open the document to retry.",
          );
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

  return { handleFile, busy, isFr };
}
