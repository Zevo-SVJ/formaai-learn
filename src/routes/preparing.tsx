import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AnalysisCeremony } from "@/components/AnalysisCeremony";
import { getPendingFile } from "@/lib/pending-upload-file";

export const Route = createFileRoute("/preparing")({
  head: () => ({
    meta: [{ title: "Preparing your document — Forma AI" }],
  }),
  component: Preparing,
});

/**
 * The analysis preview a visitor sees right after uploading on the landing,
 * before they have an account. It reuses the exact in-app analysis experience
 * (AnalysisCeremony) on the real uploaded file, then hands off to the existing
 * onboarding. No results are ever shown here — those stay locked until the
 * visitor has personalized their tutor and created an account, at which point
 * the same file is analyzed for real inside the app.
 */
function Preparing() {
  const navigate = useNavigate();
  // undefined = still reading storage, null = nothing stashed.
  const [file, setFile] = useState<File | null | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let active = true;
    getPendingFile().then((f) => {
      if (!active) return;
      if (!f) {
        // Reached with nothing to prepare (direct visit, cleared storage):
        // there is nothing to show, so return to the landing.
        navigate({ to: "/" });
        return;
      }
      setFile(f);
      url = URL.createObjectURL(f);
      setFileUrl(url);
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [navigate]);

  if (!file || !fileUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnalysisCeremony
        title={file.name.replace(/\.[^.]+$/, "")}
        mime={file.type || "application/octet-stream"}
        fileUrl={fileUrl}
        extractedText={null}
        ready
        onComplete={() => navigate({ to: "/onboarding" })}
      />
    </div>
  );
}
