# Analytics

Forma reports to GA4 property **G-K96ZD0VD5S**, and only after the student has
actively accepted analytics.

## How it is gated

Two conditions must both hold before `gtag.js` is even requested:

1. a measurement id is configured (`VITE_GA_MEASUREMENT_ID`, defaulting to the
   property above), and
2. `getConsent() === "granted"` in `src/lib/consent.ts`.

Until the student answers the banner, nothing loads, no cookie is written and no
request leaves the browser. Declining is stored too, so the banner is asked once
and never again. Consent is re-checked on every `track()` call, so a later
decline takes effect immediately.

Consent Mode is set explicitly: `analytics_storage` granted, and `ad_storage`,
`ad_user_data`, `ad_personalization` **denied**. Forma collects audience
measurement only, never advertising or personalisation data.

The banner (`src/components/ConsentBanner.tsx`) gives Accept and Decline the
same visual weight, with nothing pre-selected — declining has to be as easy as
accepting.

## Keeping the legal pages honest

`legal.cookies` and `legal.privacy` in all six dictionaries describe this setup:
Analytics runs only on acceptance, declining changes nothing, and no advertising
data is collected. If the analytics setup changes, those sections change with it.

## What is measured

Ten events, chosen to answer three questions and nothing else: do visitors
activate, where do they stop, and which features get used.

| Event                  | Fires when                                    | Answers                 |
| ---------------------- | --------------------------------------------- | ----------------------- |
| `onboarding_started`   | student passes the intro screen               | top of funnel           |
| `onboarding_completed` | onboarding is marked done                     | onboarding drop-off     |
| `account_created`      | sign-up succeeds                              | activation              |
| `lesson_uploaded`      | a document row is created (both upload paths) | core action             |
| `analysis_completed`   | a document reaches `ready`                    | does the core loop work |
| `analysis_failed`      | a document reaches `failed`                   | reliability in the wild |
| `tutor_opened`         | the "ask about this analysis" CTA is used     | feature usage           |
| `tutor_message_sent`   | a question is sent to the tutor               | depth of engagement     |
| `grade_added`          | a grade is saved in Progress                  | second-feature adoption |
| `feedback_opened`      | the contact form is submitted                 | feedback volume         |

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
