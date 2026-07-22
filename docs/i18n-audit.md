# Internationalization audit & migration plan

Status: **audit only.** No production code, flows, schema, or design changed by
this document. It records the current state and a safe, incremental path to a
proper multi-language product with English as the eventual default.

## 1. Current state

### What already exists (and works)

Forma already runs a real i18n library — **i18next + react-i18next** — not manual
text swapping. The pieces:

| Piece | Location | Notes |
|---|---|---|
| Dictionaries | `src/i18n/en.ts`, `src/i18n/fr.ts` | 24 sections, 516 lines each, structurally identical. `en.ts` exports the `Dict` type; `fr.ts` is typed `: Dict`, so the two can never drift in shape. |
| Init | `src/i18n/index.ts` | `i18n.init({ resources: { en, fr }, lng: detectInitialLocale(), fallbackLng: "en" })`. |
| Typed access | `src/hooks/useI18n.tsx` | `useI18n()` → `t((d) => d.hero.title1)` (typo-proof path via a proxy) and `raw()` for arrays/objects. |
| Locale switch | `src/components/LanguageSwitcher.tsx` | EN/FR pills, used in header, footer, auth, doc, legal pages. |
| Persistence | `localStorage["forma:locale"]` | Read in `detectInitialLocale`, written in `setLocale`. |

So for every string that lives in the dictionaries, translation is already done
"properly." The gaps below are the parts that bypass this system.

### Gap A — hardcoded bilingual ternaries (the real problem)

**25 inline `isFr ? "…" : "…"` conditionals** across 11 files hold French/English
text directly in components, bypassing the dictionaries:

| File | Count | Examples |
|---|---|---|
| `src/components/UploadArea.tsx` | 13 | "Dépose ta leçon ici", "ou glisse-dépose", upload toasts |
| `src/hooks/useLessonUpload.ts` | 8 | "Envoi", "Lecture", "Envoi impossible", analysis-failed toast |
| `src/components/QuickActionsBar.tsx` | 5 | the AI quick-action **prompt** strings ("Réexplique-moi…") |
| `src/routes/_authenticated/home.tsx` | 5 | relative time ("à l'instant", "min", "h", "j") |
| `src/routes/_authenticated/library.tsx` | 5 | relative time (duplicated logic) |
| `src/routes/api/chat.ts` | 3 | AI language line + format rules |
| `src/lib/format-answer.ts` | 2 | section labels |
| `src/components/LiveCounters.tsx`, `src/routes/_authenticated/progress.tsx`, `src/lib/curriculum.ts` | 1 each | units, labels |

Consequence: adding a third language means editing every one of these by hand —
exactly the "manual text replacement" to avoid. They only ever branch fr vs en.

### Gap B — parallel `{ en, fr }` data maps

Three data files translate through their own `{ en, fr }` object shape instead of
i18next:

- `src/lib/countries.ts` — country names.
- `src/lib/curriculum.ts` — subject names, category labels, `subjectMetric` units.
- `src/lib/format-answer.ts` — `SECTION_LABELS` (Answer/Réponse, Method/Méthode…).

This is reasonable for structured data, but it is a **second translation
mechanism** with the same fr/en-only ceiling. To add a language you edit every
tuple.

### Gap C — AI response language

- **Chat** (`src/routes/api/chat.ts`): the client sends `body: { documentId, locale }`
  from `doc.$docId.tsx`; the server builds `langLine` + `formatRules` from `isFr`.
  Section titles ("Réponse"/"Answer") are hardcoded per branch. **fr/en only.**
- **Analysis** (`src/lib/documents.functions.ts`): the prompt says *"Write EVERY
  field in the same language as the document."* So analysis follows the **document's**
  language, independent of the UI locale. This is a deliberate and correct choice
  for a lesson (a French worksheet should be explained in French), but it means
  "make AI follow the selected language" applies to **chat**, not analysis.

### Gap D — SSR & default language

- The app is server-rendered (TanStack Start). `detectInitialLocale()` returns
  `"en"` on the server (no `window`), then the client re-derives the real locale
  from localStorage/browser and calls `changeLanguage`. That is a **hydration
  mismatch**, currently papered over with `useHydrated()` gates (e.g. the
  `LanguageSwitcher` renders `null` until hydrated). Language-dependent text can
  briefly render in the wrong language on first paint.
- Default today is **browser-detected** (fr if `navigator.language` starts with
  "fr", else en), not forced English.

### Gap E — no account-level preference

Locale lives only in `localStorage`. It is **not** stored on the account, so it
does not follow a user across devices. There is no `locale` column anywhere in
the schema (`profiles`, `referral_profiles`, `documents`, `messages`, `grades`).

## 2. Recommended architecture

**Keep i18next.** It is already integrated, mature, SSR-capable, and the typed
wrapper is good. Do not introduce a new library. The work is consolidation, not
replacement.

1. **One source of truth.** Every user-facing string flows through the i18next
   dictionaries. Gaps A, B, C move into `en.ts` / `fr.ts` (or per-locale JSON, see
   below). After this, adding a language = adding one dictionary file.
2. **Dictionary format.** Two options:
   - *Stay in TypeScript* (`en.ts` as the typed source): keeps compile-time safety
     that every key exists. Best while the team is small.
   - *Move to per-locale JSON namespaces* later: better for translator tooling and
     lazy-loading, at the cost of the typed-path guarantee. Recommended only once a
     third language and outside translators are involved.
   Start with TypeScript; revisit at 3+ languages.
3. **SSR-correct locale.** Store the preference in a **cookie** (readable on the
   server) instead of localStorage. Read it in the server entry, initialise
   i18next with the request locale before render → no hydration flash, no
   `useHydrated` gating needed for text.
4. **English default.** New visitors with no cookie default to `"en"`; keep
   browser detection only as a secondary hint if desired. `fallbackLng` stays `"en"`.
5. **Preference storage.** Anonymous: cookie. Authenticated: a `locale` column on a
   profile/preferences row, written on change and read on load, with the cookie as
   the fast path. (DB change — a later step, out of scope here.)
6. **AI language policy (make it explicit).**
   - *Chat* follows the UI locale (already wired via `locale` in the request); make
     `langLine`/`formatRules`/section titles data-driven per locale instead of an
     `isFr` branch.
   - *Analysis* follows the document's own language (keep as is). Document this so
     it is a decision, not an accident.

## 3. Migration steps (incremental, each shippable and non-breaking)

- **Step 0 — audit.** This document. ✅
- **Step 1 — consolidate strings.** Move the 25 `isFr` ternaries (Gap A) into the
  dictionaries; replace with `t(...)`. Pure refactor, identical output in both
  languages, no visual change. Unblocks everything else. Extract the duplicated
  relative-time logic (`home.tsx`, `library.tsx`) into one helper that reads dict
  units.
- **Step 2 — generalise data maps.** Convert `{ en, fr }` in `countries.ts`,
  `curriculum.ts`, `format-answer.ts` to a `Record<Locale, string>` keyed by the
  active locale (or fold into i18next). Same output, N-language ready.
- **Step 3 — SSR-safe locale via cookie.** Replace the localStorage read/write in
  `i18n/index.ts` + `setLocale` with a cookie; read it server-side and pass into
  init. Removes hydration mismatch. No visible change when the cookie matches the
  old localStorage value; migrate the existing key on first load.
- **Step 4 — English default.** Flip the no-preference default to `"en"`. One line
  in `detectInitialLocale`. Do this only when the product decision is made.
- **Step 5 — account-synced preference.** Add a `locale` column (separate DB
  migration), write on change when signed in, read on load. Out of scope for the
  audit step.
- **Step 6 — prove it with a third language.** Add e.g. `es.ts` and a
  `LanguageSwitcher` entry. If Steps 1–2 are done, this is additive only.

Steps 1–2 carry the most value and the least risk; Steps 3–5 are independent and
can land in any order after.

## 4. Files that need modification (by step)

- **Step 1:** `src/i18n/en.ts`, `src/i18n/fr.ts` (add keys); `src/components/UploadArea.tsx`,
  `src/hooks/useLessonUpload.ts`, `src/components/QuickActionsBar.tsx`,
  `src/components/LiveCounters.tsx`, `src/routes/_authenticated/home.tsx`,
  `src/routes/_authenticated/library.tsx`, `src/routes/_authenticated/progress.tsx`
  (swap ternaries for `t()`).
- **Step 2:** `src/lib/countries.ts`, `src/lib/curriculum.ts`, `src/lib/format-answer.ts`.
- **Step 3:** `src/i18n/index.ts`, `src/hooks/useI18n.tsx`, `src/hooks/useHydrated.ts`
  (retire for text), the server entry (`src/server.ts` / `src/start.ts`),
  `src/components/LanguageSwitcher.tsx`.
- **Step 4:** `src/i18n/index.ts` (default only).
- **Step 5:** a new Supabase migration + a preferences read/write helper; the
  auth/session load path.
- **Step 6:** new `src/i18n/<lang>.ts` + `LanguageSwitcher.tsx`; AI prompt map in
  `src/routes/api/chat.ts`.

## 5. Risks & guardrails

- Steps 1–2 must produce byte-identical rendered text in both languages — verify
  the landing, onboarding, dashboard, and doc pages read the same before/after.
- Step 3 (cookie) is the only one touching SSR; ship it behind a careful check that
  the server and client resolve the same locale, and migrate the old localStorage
  value so no one is silently switched.
- Analysis-language behaviour (document language, not UI locale) is intentional —
  do not "fix" it into following the UI locale without a product decision.
- Nothing here changes auth, upload, AI logic, schema, or user flows.
