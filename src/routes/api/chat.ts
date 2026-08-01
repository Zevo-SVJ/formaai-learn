import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { baseLocale, LANGUAGE_NAMES, sectionTitle, sectionTitleList } from "@/lib/answer-sections";
import { consumeAiQuota } from "@/lib/ai-quota.server";

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

        // Same cost guard as the analysis. 429 so the client shows the
        // localised "too many requests" message.
        if (!(await consumeAiQuota(supabase, "chat"))) {
          return new Response("rate limit exceeded", { status: 429 });
        }

        const { data: doc, error } = await supabase
          .from("documents")
          .select("id,user_id,title,subject,level,chapter,concepts,extracted_text,explanation")
          .eq("id", documentId)
          .single();
        if (error || !doc) return new Response("Not found", { status: 404 });

        const userId = doc.user_id;
        const explanation = (doc.explanation as Record<string, string>) || {};
        const base = baseLocale(locale);
        const isFr = base === "fr";
        // French and English keep their original hand-written prompts untouched.
        // Every other supported language reuses the English rules, with the
        // target language and its own section headers injected, so the parser
        // recognises whatever the model emits.
        const langLine = isFr
          ? "Réponds toujours en français, quel que soit la langue de la question."
          : base === "en"
            ? "Always answer in English unless the student writes in another language."
            : `Always answer in ${LANGUAGE_NAMES[base] ?? "English"}, whatever language the question is written in.`;

        const formatRules = isFr
          ? `CHOISIR LA FORME (avant tout le reste) :
- Question simple ou factuelle, ou simple échange : réponds normalement, en une ou deux phrases, SANS aucun titre de section.
- Demande de résumé : un court paragraphe ou une liste, SANS titre de section.
- Demande d'explication, de méthode, ou exercice à résoudre : utilise les sections ci-dessous.
- Dans le doute, choisis la réponse simple. Les sections servent à enseigner, pas à décorer.

QUAND L'ÉLÈVE DEMANDE UNE RESSOURCE (quiz, fiche de révision, cartes mémoire, explication en cartes) :
- Écris une phrase d'introduction très courte, puis UN SEUL bloc, exactement dans ce format :
\`\`\`forma
{"kind":"quiz","title":"...","questions":[{"q":"...","options":["...","..."],"answer":0,"why":"..."}]}
\`\`\`
- kind vaut "quiz", "sheet" (fiche de révision, avec le texte dans "body") ou "deck" (cartes mémoire ou explication en cartes, avec "cards":[{"title":"...","text":"..."}]).
- "answer" est l'index de la bonne option, en partant de 0.
- N'écris rien après le bloc, et n'utilise aucun titre de section dans ce cas.

RÈGLES DE FORMAT (obligatoires) :
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
          : `CHOOSING THE SHAPE (before anything else):
- A simple or factual question, or ordinary back-and-forth: answer normally, in a sentence or two, with NO section titles at all.
- A request for a summary: a short paragraph or a list, with NO section titles.
- A request for an explanation or a method, or an exercise to solve: use the sections below.
- When in doubt, choose the plain answer. Sections are for teaching, not for decoration.

WHEN THE STUDENT ASKS FOR A RESOURCE (quiz, revision sheet, flashcards, explanation as cards):
- Write one very short lead-in sentence, then ONE block, exactly in this format:
\`\`\`forma
{"kind":"quiz","title":"...","questions":[{"q":"...","options":["...","..."],"answer":0,"why":"..."}]}
\`\`\`
- kind is "quiz", "sheet" (revision sheet, text in "body") or "deck" (flashcards or an explanation as cards, with "cards":[{"title":"...","text":"..."}]).
- "answer" is the index of the correct option, counting from 0.
- Write nothing after the block, and use no section titles in this case.

FORMAT RULES (mandatory):
- No markdown. No # or ##. No bold syntax (** or __). No italics.
- Never use the em dash character. Use a comma or a period.
- No unnecessary introduction. The answer comes first.
- Use EXACTLY these section titles, each on its own line, no punctuation:
${sectionTitleList(base).join("\n")}
- Not all sections are required. Use only the ones that help.
- If the exercise is multiple choice, put items directly in "${sectionTitle("answer", base)}", one per line:
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
