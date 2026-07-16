import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Body = { messages?: UIMessage[]; documentId?: string; locale?: string };

function makeUserClient(token: string) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        h.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") || "";
        const token = auth.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { messages, documentId, locale } = (await request.json()) as Body;
        if (!Array.isArray(messages) || !documentId) {
          return new Response("Bad request", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const supabase = makeUserClient(token);
        const { data: doc, error } = await supabase
          .from("documents")
          .select("id,user_id,title,subject,level,chapter,concepts,extracted_text,explanation")
          .eq("id", documentId)
          .single();
        if (error || !doc) return new Response("Not found", { status: 404 });

        const userId = doc.user_id;
        const explanation = (doc.explanation as Record<string, string>) || {};
        const isFr = (locale || "en").startsWith("fr");
        const langLine = isFr
          ? "Réponds toujours en français, quel que soit la langue de la question."
          : "Always answer in English unless the student writes in another language.";

        const formatRules = isFr
          ? `RÈGLES DE FORMAT (obligatoires) :
- Aucun markdown, aucun # ni ##, aucune syntaxe de gras (** ou __), aucune italique.
- N'utilise jamais le tiret cadratin (—). Utilise une virgule ou un point.
- Aucune longue introduction. La réponse arrive tout de suite.
- Utilise EXACTEMENT ces titres de sections, sur leur propre ligne, sans ponctuation :
Réponse
Explication
Méthode
Erreurs fréquentes
Pour aller plus loin
- Toutes les sections ne sont pas obligatoires. Utilise seulement celles qui aident.
- Si l'exercice est à choix multiples, place les items directement dans "Réponse", un par ligne :
A) ...
B) ...
C) ...
D) ...
- Utilise des paragraphes courts. Va droit au but. Une idée par paragraphe.`
          : `FORMAT RULES (mandatory):
- No markdown. No # or ##. No bold syntax (** or __). No italics.
- Never use the em dash character. Use a comma or a period.
- No unnecessary introduction. The answer comes first.
- Use EXACTLY these section titles, each on its own line, no punctuation:
Answer
Explanation
Method
Common mistakes
Additional details
- Not all sections are required. Use only the ones that help.
- If the exercise is multiple choice, put items directly in "Answer", one per line:
A) ...
B) ...
C) ...
D) ...
- Short paragraphs. One idea per paragraph. Get to the point.`;

        const context = `You are Forma AI, a warm and precise tutor for a middle- or high-school student.
Only teach from the uploaded lesson. Never help the student cheat. When they ask for a homework answer directly, guide them through the method rather than dropping the raw solution.
${langLine}

${formatRules}

LESSON METADATA
Title: ${doc.title}
Subject: ${doc.subject ?? "unknown"}
Level: ${doc.level ?? "unknown"}
Chapter: ${doc.chapter ?? "unknown"}

LESSON CONTENT (verbatim from the document, may include OCR)
${(doc.extracted_text || "").slice(0, 12000)}

CURRENT STRUCTURED EXPLANATION
Explanation: ${explanation.explanation ?? ""}
Why it matters: ${explanation.why ?? ""}
Common mistake: ${explanation.common_mistake ?? ""}
Example: ${explanation.example ?? ""}
Analogy: ${explanation.analogy ?? ""}`;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        // Persist the latest user message immediately.
        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const text = last.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("")
            .trim();
          if (text) {
            await supabase.from("messages").insert({
              document_id: documentId,
              user_id: userId,
              role: "user",
              content: text,
            });
          }
        }

        const result = streamText({
          model,
          system: context,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            const text = responseMessage.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")
              .trim();
            if (text) {
              await supabase.from("messages").insert({
                document_id: documentId,
                user_id: userId,
                role: "assistant",
                content: text,
              });
            }
          },
        });
      },
    },
  },
});
