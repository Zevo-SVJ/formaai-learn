import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AppHeader } from "@/components/AppHeader";
import { addGrade, deleteGrade, listGrades, updateGrade } from "@/lib/grades.functions";
import { useI18n } from "@/hooks/useI18n";
import { Plus, Pencil, Trash2, X, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/progress")({
  component: ProgressPage,
});

type Grade = {
  id: string;
  subject: string;
  assignment: string | null;
  grade: number;
  max_grade: number;
  coefficient: number;
  date: string;
  note: string | null;
};

type Range = "week" | "month" | "year" | "all";

const SCALES = [5, 10, 20, 50, 100];

function ProgressPage() {
  const { t, locale } = useI18n();
  const list = useServerFn(listGrades);
  const del = useServerFn(deleteGrade);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: () => list() as Promise<Grade[]>,
  });

  const [range, setRange] = useState<Range>("month");
  const [editing, setEditing] = useState<Grade | null>(null);
  const [open, setOpen] = useState(false);

  const grades = data ?? [];

  const inRange = useMemo(() => {
    if (range === "all") return grades;
    const now = new Date();
    const start = new Date(now);
    if (range === "week") start.setDate(now.getDate() - 7);
    else if (range === "month") start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);
    return grades.filter((g) => new Date(g.date) >= start);
  }, [grades, range]);

  const chartData = useMemo(() => {
    return [...inRange]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((g) => ({
        date: g.date,
        value: (Number(g.grade) / Number(g.max_grade)) * 20,
        label: g.subject,
      }));
  }, [inRange]);

  const overall = useMemo(() => weighted(inRange), [inRange]);
  const bySubject = useMemo(() => {
    const map = new Map<string, Grade[]>();
    for (const g of inRange) {
      const k = g.subject;
      const list = map.get(k) ?? [];
      list.push(g);
      map.set(k, list);
    }
    return Array.from(map.entries())
      .map(([subject, arr]) => ({ subject, avg: weighted(arr) ?? 0, count: arr.length }))
      .sort((a, b) => b.avg - a.avg);
  }, [inRange]);

  const remove = async (id: string) => {
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["grades"] });
    toast.success(t((d) => d.progressPage.deleted));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[30px] font-bold tracking-tight text-foreground sm:text-[36px]">
              {t((d) => d.progressPage.title)}
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {t((d) => d.progressPage.subtitle)}
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[13.5px] font-semibold text-background"
          >
            <Plus className="h-4 w-4" /> {t((d) => d.progressPage.add)}
          </button>
        </div>

        {/* Overall + range */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t((d) => d.progressPage.overall)}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[42px] font-bold text-foreground">
                {overall == null ? "—" : formatNum(overall, locale)}
              </span>
              <span className="text-[15px] font-semibold text-muted-foreground">/ 20</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald">
              <TrendingUp className="h-3.5 w-3.5" /> {inRange.length} {t((d) => d.progressPage.entries)}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t((d) => d.progressPage.trend)}
              </div>
              <div className="flex rounded-full bg-surface-muted p-0.5">
                {(["week", "month", "year", "all"] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={[
                      "px-3 py-1 text-[12px] font-semibold rounded-full transition-colors",
                      range === r ? "bg-foreground text-background" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {t((d) => d.progressPage.ranges[r])}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[220px]">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                  {t((d) => d.progressPage.noData)}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -14 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [formatNum(v, locale) + " / 20", ""]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--emerald))"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "hsl(var(--emerald))" }}
                      activeDot={{ r: 5 }}
                      animationDuration={500}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* By subject */}
        <section className="mt-8">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t((d) => d.progressPage.bySubject)}
          </h2>
          {bySubject.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-[14px] text-muted-foreground">
              {t((d) => d.progressPage.noData)}
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {bySubject.map((s) => (
                <div key={s.subject} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold text-foreground">{s.subject}</span>
                    <span className="text-[13px] font-semibold text-muted-foreground">
                      {formatNum(s.avg, locale)} / 20
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-emerald"
                      style={{ width: `${Math.min(100, (s.avg / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {s.count} {t((d) => d.progressPage.entries)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Entries */}
        <section className="mt-10">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t((d) => d.progressPage.recent)}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : grades.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-[14px] text-muted-foreground">
              {t((d) => d.progressPage.empty)}
            </div>
          ) : (
            <ul className="space-y-2">
              {grades.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-[14.5px] font-semibold text-foreground">
                        {g.subject}
                      </span>
                      {g.assignment && (
                        <span className="truncate text-[12.5px] text-muted-foreground">
                          {g.assignment}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {g.date} · ×{g.coefficient}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-foreground">
                      {formatNum(Number(g.grade), locale)} / {formatNum(Number(g.max_grade), locale)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditing(g);
                      setOpen(true);
                    }}
                    className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(g.id)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <AnimatePresence>
        {open && (
          <GradeSheet
            initial={editing}
            onClose={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["grades"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function weighted(items: Grade[]): number | null {
  if (items.length === 0) return null;
  let sum = 0;
  let coefs = 0;
  for (const g of items) {
    const norm = (Number(g.grade) / Number(g.max_grade)) * 20;
    sum += norm * Number(g.coefficient);
    coefs += Number(g.coefficient);
  }
  if (coefs === 0) return null;
  return sum / coefs;
}

function formatNum(n: number, locale: string) {
  return new Intl.NumberFormat(locale.startsWith("fr") ? "fr-FR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(n);
}

function GradeSheet({
  initial,
  onClose,
  onSaved,
}: {
  initial: Grade | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const add = useServerFn(addGrade);
  const upd = useServerFn(updateGrade);

  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [assignment, setAssignment] = useState(initial?.assignment ?? "");
  const [grade, setGrade] = useState<string>(initial ? String(initial.grade) : "");
  const [maxGrade, setMaxGrade] = useState<number>(initial ? Number(initial.max_grade) : 20);
  const [customMax, setCustomMax] = useState<string>(
    initial && !SCALES.includes(Number(initial.max_grade)) ? String(initial.max_grade) : "",
  );
  const [coef, setCoef] = useState<string>(initial ? String(initial.coefficient) : "1");
  const [date, setDate] = useState<string>(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(grade.replace(",", "."));
    const mg = customMax ? parseFloat(customMax.replace(",", ".")) : maxGrade;
    const c = parseFloat(coef.replace(",", ".")) || 1;
    if (!subject.trim() || Number.isNaN(g) || !mg || mg <= 0 || g < 0 || g > mg) {
      toast.error(t((d) => d.progressPage.invalid));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        subject: subject.trim(),
        assignment: assignment.trim() || null,
        grade: g,
        max_grade: mg,
        coefficient: c,
        date,
        note: note.trim() || null,
      };
      if (initial) await upd({ data: { ...payload, id: initial.id } });
      else await add({ data: payload });
      toast.success(t((d) => d.progressPage.saved));
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-foreground">
            {initial ? t((d) => d.progressPage.editGrade) : t((d) => d.progressPage.newGrade)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          <Field label={t((d) => d.progressPage.fields.subject)}>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-emerald"
            />
          </Field>
          <Field label={t((d) => d.progressPage.fields.assignment)}>
            <input
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-emerald"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t((d) => d.progressPage.fields.grade)}>
              <input
                required
                inputMode="decimal"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-emerald"
              />
            </Field>
            <Field label={t((d) => d.progressPage.fields.scale)}>
              <div className="flex flex-wrap gap-1">
                {SCALES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setMaxGrade(s);
                      setCustomMax("");
                    }}
                    className={[
                      "rounded-full px-3 py-1.5 text-[12.5px] font-semibold border",
                      !customMax && maxGrade === s
                        ? "border-emerald bg-emerald text-white"
                        : "border-border bg-surface text-foreground",
                    ].join(" ")}
                  >
                    /{s}
                  </button>
                ))}
                <input
                  placeholder={t((d) => d.progressPage.fields.custom)}
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  inputMode="decimal"
                  className="w-20 rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] outline-none focus:border-emerald"
                />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t((d) => d.progressPage.fields.coef)}>
              <input
                inputMode="decimal"
                value={coef}
                onChange={(e) => setCoef(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-emerald"
              />
            </Field>
            <Field label={t((d) => d.progressPage.fields.date)}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none focus:border-emerald"
              />
            </Field>
          </div>
          <Field label={t((d) => d.progressPage.fields.note)}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] outline-none focus:border-emerald"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-[15px] font-semibold text-background disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {t((d) => d.common.save)}
        </button>
      </motion.form>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
