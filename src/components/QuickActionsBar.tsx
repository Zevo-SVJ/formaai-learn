import { Wand2, BookOpen, ClipboardList, ListChecks } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export type QuickAction = { id: string; label: string; prompt: string; icon: React.ComponentType<{ className?: string }> };

export function useQuickActions(): QuickAction[] {
  const { t } = useI18n();
  return [
    {
      id: "simpler",
      label: t((d) => d.doc.quickActions.simpler),
      icon: Wand2,
      prompt: t((d) => d.doc.quickActions.prompts.simpler),
    },
    {
      id: "example",
      label: t((d) => d.doc.quickActions.example),
      icon: BookOpen,
      prompt: t((d) => d.doc.quickActions.prompts.example),
    },
    {
      id: "revision",
      label: t((d) => d.doc.quickActions.revision),
      icon: ClipboardList,
      prompt: t((d) => d.doc.quickActions.prompts.revision),
    },
    {
      id: "quiz",
      label: t((d) => d.doc.quickActions.quiz),
      icon: ListChecks,
      prompt: t((d) => d.doc.quickActions.prompts.quiz),
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
