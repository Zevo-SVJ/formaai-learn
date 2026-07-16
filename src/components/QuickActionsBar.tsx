import { Wand2, BookOpen, ClipboardList, ListChecks } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export type QuickAction = { id: string; label: string; prompt: string; icon: React.ComponentType<{ className?: string }> };

export function useQuickActions(): QuickAction[] {
  const { t, locale } = useI18n();
  const isFr = locale.startsWith("fr");
  return [
    {
      id: "simpler",
      label: t((d) => d.doc.quickActions.simpler),
      icon: Wand2,
      prompt: isFr
        ? "Réexplique-moi ta dernière réponse plus simplement, comme à quelqu'un qui découvre le sujet."
        : "Explain your last answer in a simpler way, for someone new to the topic.",
    },
    {
      id: "example",
      label: t((d) => d.doc.quickActions.example),
      icon: BookOpen,
      prompt: isFr
        ? "Donne un exemple concret et détaillé qui illustre ta dernière réponse."
        : "Give a concrete, worked example that illustrates your last answer.",
    },
    {
      id: "revision",
      label: t((d) => d.doc.quickActions.revision),
      icon: ClipboardList,
      prompt: isFr
        ? "Crée-moi une fiche de révision claire à partir de ta dernière réponse."
        : "Create a clean revision sheet from your last answer.",
    },
    {
      id: "quiz",
      label: t((d) => d.doc.quickActions.quiz),
      icon: ListChecks,
      prompt: isFr
        ? "Génère un quiz de 3 questions ciblées sur ta dernière réponse. Pose-les une par une et attends ma réponse à chaque fois."
        : "Generate a 3-question quiz focused on your last answer. Ask one at a time and wait for my answer.",
    },
  ];
}

export function QuickActionsBar({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled?: boolean;
}) {
  const actions = useQuickActions();
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {actions.map(({ id, label, icon: Icon, prompt }) => (
        <button
          key={id}
          onClick={() => onPick(prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground transition hover:border-border-strong hover:bg-surface-muted disabled:opacity-50"
        >
          <Icon className="h-3 w-3 text-emerald" />
          {label}
        </button>
      ))}
    </div>
  );
}
