import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Body = { messages?: UIMessage[]; documentId?: string };

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

        const { messages, documentId } = (await request.json()) as Body;
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
        const context = `You are Forma AI, a warm, precise tutor for a student.
You must ONLY teach from the uploaded lesson. Never help the student cheat: no
direct answers to homework unless the student demonstrates understanding.
Prefer short paragraphs, plain language, and no italic text.

LESSON METADATA
- Title: ${doc.title}
- Subject: ${doc.subject ?? "unknown"}
- Level: ${doc.level ?? "unknown"}
- Chapter: ${doc.chapter ?? "unknown"}

LESSON CONTENT (verbatim from the document, may include OCR)
${(doc.extracted_text || "").slice(0, 12000)}

CURRENT STRUCTURED EXPLANATION
- Explanation: ${explanation.explanation ?? ""}
- Why it matters: ${explanation.why ?? ""}
- Common mistake: ${explanation.common_mistake ?? ""}
- Example: ${explanation.example ?? ""}
- Analogy: ${explanation.analogy ?? ""}`;

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
