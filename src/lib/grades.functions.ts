import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GradeInput = z.object({
  subject: z.string().trim().min(1).max(80),
  assignment: z.string().trim().max(160).optional().nullable(),
  grade: z.number().finite().min(0).max(1000),
  max_grade: z.number().finite().min(0.01).max(1000).default(20),
  coefficient: z.number().finite().min(0.1).max(20).default(1),
  date: z.string().optional().nullable(), // ISO date
  note: z.string().trim().max(500).optional().nullable(),
});

export const listGrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("grades")
      .select("id, subject, assignment, grade, max_grade, coefficient, date, note, created_at")
      .eq("user_id", context.userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => GradeInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("grades")
      .insert({
        user_id: context.userId,
        subject: data.subject,
        assignment: data.assignment ?? null,
        grade: data.grade,
        max_grade: data.max_grade,
        coefficient: data.coefficient,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        note: data.note ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return row;
  });

export const updateGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ id: z.string().uuid(), patch: GradeInput.partial() }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("grades")
      .update({
        ...data.patch,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("grades")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
