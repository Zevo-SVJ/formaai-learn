# Analytics

Forma ships with a GA4 integration that is **installed but switched off**. With
no measurement id configured, `src/lib/analytics.ts` loads nothing, sets no
cookie and sends no request. That is the current state, and it is what keeps the
cookie policy ("no analytics, no third-party trackers") accurate.

## Turning it on

1. Create a GA4 property and copy its measurement id (`G-XXXXXXXXXX`).
2. Set `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in the deployment environment.
3. Redeploy. `initAnalytics()` runs after hydration and starts reporting.

### Before you do, read this

GA4 writes cookies that are **not** strictly necessary. Two things must happen
at the same time, or Forma's own published policy becomes untrue:

- **Update the legal copy.** `legal.cookies` currently states there is no
  audience measurement and promises "if that ever changes, we will ask for your
  agreement first". `legal.privacy` says the same. Both must be updated in **all
  six dictionaries** (`en, fr, es, de, pt, it`) — they are typed against `Dict`,
  so tsc will not let one drift.
- **Ask for consent first.** In the EU, non-essential cookies need consent
  before they are set. Gate `initAnalytics()` behind that choice.

Until both are done, leave the variable unset. Everything else already works.

## What is measured

Ten events, chosen to answer three questions and nothing else: do visitors
activate, where do they stop, and which features get used.

| Event | Fires when | Answers |
|---|---|---|
| `onboarding_started` | student passes the intro screen | top of funnel |
| `onboarding_completed` | onboarding is marked done | onboarding drop-off |
| `account_created` | sign-up succeeds | activation |
| `lesson_uploaded` | a document row is created (both upload paths) | core action |
| `analysis_completed` | a document reaches `ready` | does the core loop work |
| `analysis_failed` | a document reaches `failed` | reliability in the wild |
| `tutor_opened` | the "ask about this analysis" CTA is used | feature usage |
| `tutor_message_sent` | a question is sent to the tutor | depth of engagement |
| `grade_added` | a grade is saved in Progress | second-feature adoption |
| `feedback_opened` | the contact form is submitted | feedback volume |

`analysis_completed` carries the subject, `lesson_uploaded` carries the mime
type. Nothing else is attached: no document ids, no titles, no file names, no
message contents.

## Rules

- Analytics never blocks or breaks the UI. Every call is wrapped so a failure
  is silent.
- No page URL beyond the path is recorded — document ids and referral codes
  live in paths and do not belong in an analytics account.
- Adding an event is a deliberate decision. Extend `AnalyticsEvent` in
  `src/lib/analytics.ts` and add a row to the table above.
