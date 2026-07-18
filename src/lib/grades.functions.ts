import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GradeInput = z.object({
  subject: z.string().min(1).max(80),
  assignment: z.string().max(120).optional().nullable(),
  grade: z.number(),
  max_grade: z.number().positive(),
  coefficient: z.number().positive().default(1),
  date: z.string().optional(),
  note: z.string().max(500).optional().nullable(),
});

export const listGrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("grades")
      .select("*")
      .eq("user_id", context.userId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const addGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GradeInput.parse(input))
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
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

const UpdateInput = GradeInput.extend({ id: z.string().uuid() });

export const updateGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("grades")
      .update({
        subject: rest.subject,
        assignment: rest.assignment ?? null,
        grade: rest.grade,
        max_grade: rest.max_grade,
        coefficient: rest.coefficient,
        date: rest.date ?? new Date().toISOString().slice(0, 10),
        note: rest.note ?? null,
      })
      .eq("id", id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

const IdInput = z.object({ id: z.string().uuid() });

export const deleteGrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("grades")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
