import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDocuments } from "@/lib/documents.functions";
import { Logo } from "@/components/Logo";
import { UploadArea } from "@/components/UploadArea";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, LogOut, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  component: Library,
});

function statusBadge(status: string) {
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 text-[11px] font-semibold text-emerald">
        <CheckCircle2 className="h-3 w-3" /> Ready
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
        <AlertCircle className="h-3 w-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" /> Analyzing
    </span>
  );
}

function Library() {
  const navigate = useNavigate();
  const list = useServerFn(listDocuments);
  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => list(),
    refetchInterval: (q) => {
      const rows = (q.state.data as Array<{ status: string }> | undefined) ?? [];
      return rows.some((r) => r.status !== "ready" && r.status !== "failed") ? 2500 : false;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link to="/library"><Logo /></Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-14">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your library</h1>
          <p className="text-sm text-muted-foreground">Upload a lesson to start learning.</p>
        </div>

        <div className="mb-10">
          <UploadArea />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!isLoading && (data ?? []).length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              Nothing here yet. Upload your first lesson above.
            </div>
          )}
          {(data ?? []).map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                to="/doc/$docId"
                params={{ docId: d.id }}
                className="group block rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-soft">
                    <BookOpen className="h-5 w-5 text-emerald" />
                  </div>
                  {statusBadge(d.status)}
                </div>
                <h3 className="mt-4 line-clamp-2 text-[16px] font-bold text-foreground">
                  {d.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {d.subject && <span>{d.subject}</span>}
                  {d.level && <span>· {d.level}</span>}
                  {d.chapter && <span>· {d.chapter}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
