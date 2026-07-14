import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AnalyzeInput = z.object({ documentId: z.string().uuid() });

// Real analysis: downloads the uploaded file, calls Gemini multimodal via
// Lovable AI Gateway, and writes structured results into the document row.
export const analyzeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { documentId } = data;

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();
    if (docErr || !doc) throw new Error("Document not found");

    await supabase.from("documents").update({ status: "extracting" }).eq("id", documentId);

    // Download the file bytes via signed URL (RLS-safe path).
    const { data: signed, error: signErr } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);
    if (signErr || !signed) throw new Error("Could not read file");

    const fileRes = await fetch(signed.signedUrl);
    if (!fileRes.ok) throw new Error("Could not download file");
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = btoa(binary);
    const mime = doc.mime || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${b64}`;

    await supabase.from("documents").update({ status: "analyzing" }).eq("id", documentId);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // Compose multimodal content block based on file kind.
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";
    const contentBlocks: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `You are Forma AI, a tutor for middle- and high-school students. Analyze the attached document and reply with ONLY a compact JSON object matching this shape (no markdown fences):
{
  "title": string (max 60 chars, human title of the lesson),
  "subject": string (e.g. Math, Biology, History, French, Physics),
  "level": string (e.g. Grade 8, Grade 10, High School),
  "chapter": string (chapter / topic name),
  "concepts": string[] (3-6 key concepts, short),
  "extracted_text": string (clean plain text of the document; OCR if it is an image; keep formulas readable),
  "explanation": {
    "explanation": string (2-4 short paragraphs teaching the core idea, adapted to the level),
    "why": string (why this matters, 1-2 sentences),
    "common_mistake": string (a mistake students commonly make),
    "example": string (one worked simple example),
    "analogy": string (optional everyday analogy; empty string if none)
  }
}
Never invent content that isn't present in the document. Never write italic text. If the document is unreadable, set fields to "" and put a short reason in extracted_text.`,
      },
    ];
    if (isImage) {
      contentBlocks.push({ type: "image_url", image_url: { url: dataUrl } });
    } else if (isPdf) {
      contentBlocks.push({
        type: "file",
        file: { filename: doc.title || "document.pdf", file_data: dataUrl },
      });
    } else {
      // treat as text
      const text = new TextDecoder().decode(buf).slice(0, 40000);
      contentBlocks[0] = {
        type: "text",
        text: (contentBlocks[0] as { text: string }).text + "\n\nDocument text:\n" + text,
      };
    }

    const gwRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: contentBlocks }],
      }),
    });

    if (!gwRes.ok) {
      const errText = await gwRes.text();
      await supabase
        .from("documents")
        .update({ status: "failed", error: `AI ${gwRes.status}: ${errText.slice(0, 500)}` })
        .eq("id", documentId);
      throw new Error(`AI gateway error ${gwRes.status}`);
    }
    const payload = (await gwRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    let parsed: Record<string, unknown> | null = null;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }
    if (!parsed) {
      await supabase
        .from("documents")
        .update({ status: "failed", error: "Could not parse AI response" })
        .eq("id", documentId);
      throw new Error("Could not parse AI response");
    }

    const explanation = (parsed.explanation as Record<string, unknown>) ?? {};
    const { error: upErr } = await supabase
      .from("documents")
      .update({
        title: (parsed.title as string) || doc.title || "Untitled lesson",
        subject: (parsed.subject as string) || null,
        level: (parsed.level as string) || null,
        chapter: (parsed.chapter as string) || null,
        concepts: (parsed.concepts as string[] | null) ?? null,
        extracted_text: (parsed.extracted_text as string) || null,
        explanation: {
          explanation: String(explanation.explanation ?? ""),
          why: String(explanation.why ?? ""),
          common_mistake: String(explanation.common_mistake ?? ""),
          example: String(explanation.example ?? ""),
          analogy: String(explanation.analogy ?? ""),
        },
        status: "ready",
        error: null,
      })
      .eq("id", documentId);
    if (upErr) throw upErr;

    return { ok: true };
  });

const IdInput = z.object({ id: z.string().uuid() });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();
    if (error) throw error;
    return doc;
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("id,title,subject,level,chapter,status,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id,role,content,created_at")
      .eq("document_id", data.id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

const SignedUrlInput = z.object({ path: z.string() });

export const getSignedFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SignedUrlInput.parse(input))
  .handler(async ({ data, context }) => {
    // Only allow paths inside the caller's own folder.
    if (!data.path.startsWith(context.userId + "/")) throw new Error("Forbidden");
    const { data: signed, error } = await context.supabase.storage
      .from("documents")
      .createSignedUrl(data.path, 60 * 60);
    if (error || !signed) throw error ?? new Error("Signing failed");
    return { url: signed.signedUrl };
  });
