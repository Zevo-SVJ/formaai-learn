Forma AI — full build plan

Scope confirmed from your brief: threaded conversations per document, persisted in the database (Lovable Cloud / Supabase). Real AI analysis via Lovable AI Gateway (Gemini multimodal for vision + text).

## 1. Foundation
- Enable Lovable Cloud (Supabase: auth, DB, storage).
- Install logo as brand asset; build design system in `src/styles.css`:
  - Warm white bg (`oklch` warm), charcoal fg, emerald accent, subtle shadows, larger radii.
  - Typography: bold display (e.g. Geist / Inter Tight via `<link>`), no italics anywhere (global `font-style: normal !important` safety).
  - Motion: framer-motion for transitions.

## 2. Routing (TanStack Start)
- `/` — Landing (upload hero as the product).
- `/auth` — Continue with Google / Apple / Email (magic link).
- `/_authenticated/library` — user's uploaded documents list.
- `/_authenticated/doc/$docId` — Explanation page + chat.
- Sitemap + robots + llms.txt + real head metadata.

## 3. Database schema
- `profiles(id, display_name, avatar_url)` + trigger on `auth.users`.
- `documents(id, user_id, title, storage_path, mime, subject, level, chapter, concepts jsonb, extracted_text, status, created_at)`.
- `explanations(id, document_id, explanation, why, common_mistake, example, analogy)`.
- `messages(id, document_id, user_id, role, content, created_at)`.
- Storage bucket `documents` (private, per-user path).
- RLS: owner-only; grants for `authenticated` + `service_role`.

## 4. Real AI pipeline (server functions)
- `uploadAndAnalyze`: signed upload → server fn reads file → sends to Gemini multimodal (`google/gemini-3-flash-preview`) with prompt to (a) extract text/OCR, (b) detect subject, level, chapter, concepts, (c) produce structured explanation via AI SDK `Output.object`. Persists rows. No fake data — if extraction fails, surface real error.
- `chatWithDoc`: streaming chat server route (`/api/chat`) that loads document context (extracted_text + explanation) and streams responses. Quick actions (Explain differently, ELI10, Another example, Summarize, Flashcards, Quiz) send preset prompts.
- Loading states reflect real stages (uploading → extracting → analyzing → done) driven by DB status.

## 5. Landing page (product-as-hero)
- Hero = large drag-and-drop upload area with headline + subtitle. Drop triggers auth if signed out, then analyze.
- Sections: Problem → Solution → How it works → Supported types (horizontal snap carousel, icon+title placeholders ready for your icons) → Testimonials (modest, believable) → FAQ → Final CTA.
- No fake dashboards or mockups.

## 6. Explanation page
- Desktop: split (document viewer left, explanation+chat right). Mobile: stacked.
- Document viewer: image preview or PDF via `<iframe>`/`react-pdf`-lite (native `<embed>` for simplicity).
- Structured sections rendered as cards: Explanation / Why this matters / Common mistake / Simple example / Analogy.
- Chat composer pinned bottom with quick-action chips; streaming via AI SDK `useChat`.

## 7. Auth
- Google via Lovable broker, Apple via Supabase provider, Email magic link. Minimal UI, one screen.

## 8. Polish
- Framer-motion page/element transitions, smooth scroll, iOS-feel tap states.
- Mobile-first breakpoints; desktop expands.
- Global no-italic rule.

## Technical notes
- AI: `google/gemini-3-flash-preview` multimodal for extraction+analysis in one call, structured via `Output.object` with a small schema. Chat uses `streamText` + `toUIMessageStreamResponse`.
- Threaded chat contract: each `documents` row is a thread; route `/doc/$docId` is the dedicated thread URL; messages persisted server-side in `onFinish`.
- Icons for supported types: placeholder Lucide icons now; swap when you upload yours.

Once approved I'll enable Cloud and start building.