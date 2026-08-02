import { supabase } from "@/integrations/supabase/client";

/**
 * Who the person in front of the app is, and how far they have got.
 *
 * The app used to answer this from a localStorage key. That is browser state,
 * not account state: the same student on a second device was a stranger, shown
 * the landing, walked through onboarding again and asked to create an account
 * they already had.
 *
 * The account is the truth now, and it is kept on the auth user rather than in
 * a table of our own. That is a deliberate choice: a profiles table would need
 * a migration applied to production before any of this worked, and a feature
 * that only works after somebody remembers to run a command is a feature that
 * is broken on the day it ships. User metadata travels with the session, needs
 * no schema, and is already returned by the call that establishes who is
 * signed in - so reading it costs nothing extra.
 *
 * It is user-writable, which would matter if it guarded anything. It guards
 * whether a setup screen is shown; forging it only lets someone skip questions
 * they were free to skip anyway.
 *
 * localStorage keeps a copy, but nothing routes on it. A stored guess is what
 * caused the outage this module now guards against: the landing wrote
 * "visitor" into it on every visit, and the screens that read it synchronously
 * believed that about people who were signed in. It exists so a legacy install
 * and a rollback stay coherent, and for nothing else.
 */

export type Stage =
  /** No session. The landing is for these people, and only these people. */
  | "visitor"
  /** Signed in, onboarding not finished. Resume it rather than restart it. */
  | "onboarding"
  /** Signed in and set up. Straight to the app; never the landing again. */
  | "ready";

export type Account = {
  stage: Stage;
  userId: string | null;
  /** Whatever onboarding had collected, for resuming where it stopped. */
  answers: Record<string, unknown>;
};

const MIRROR = "forma:account";

/** The old key, from when a browser was the only thing that remembered. */
const LEGACY_DONE = "forma:onboarded";
const LEGACY_ANSWERS = "forma:onboardingAnswers";

/** Finished onboarding that has not found an account to belong to yet. */
const PENDING = "forma:onboardingPending";

function readMirror(): Account | null {
  try {
    const raw = window.localStorage.getItem(MIRROR);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

function writeMirror(a: Account) {
  try {
    window.localStorage.setItem(MIRROR, JSON.stringify(a));
    // Kept in step so a rollback, or a tab still running the old build, does
    // not start asking a set-up account to onboard again.
    if (a.stage === "ready") window.localStorage.setItem(LEGACY_DONE, "1");
  } catch {
    // Private mode. The account still knows; this browser just will not
    // remember between paints.
  }
}

/** What onboarding writes onto the auth user. */
const DONE_AT = "forma_onboarded_at";
const ANSWERS = "forma_onboarding_answers";

/**
 * How new an account has to be for "no completion marker" to mean "has not been
 * through setup" rather than "predates the marker".
 *
 * This is the whole safety of the thing. The marker was introduced today, so no
 * account that existed before it carries one, and treating its absence as
 * "never onboarded" reclassified every existing student as brand new and sent
 * them all back through setup. Absence only means something on an account
 * young enough to have been created after the marker existed.
 */
const NEW_ACCOUNT_MS = 15 * 60_000;

/**
 * Asks the account itself.
 *
 * One call, the same one the route guard already makes: the session carries the
 * metadata, so knowing who is here and knowing how far they got is a single
 * round trip rather than two.
 */
export async function loadAccount(): Promise<Account> {
  let meta: Record<string, unknown> | null = null;
  let userId: string | null = null;
  let createdAt: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      userId = data.user.id;
      createdAt = data.user.created_at ?? null;
      meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    }
  } catch {
    // A Web Locks timeout, most likely. Treated as signed out, same as the
    // route guard does.
  }

  if (!userId) {
    const out: Account = { stage: "visitor", userId: null, answers: {} };
    writeMirror(out);
    return out;
  }

  const answers = (meta?.[ANSWERS] as Record<string, unknown>) ?? {};

  // Settled, and nothing else needs asking.
  if (meta?.[DONE_AT]) {
    const out: Account = { stage: "ready", userId, answers };
    writeMirror(out);
    return out;
  }

  // No marker. The default is "ready", deliberately: being sent to the app when
  // setup was owed costs a student some personalisation, being sent to setup
  // when it was not owed locks them out of an account they already have. Only
  // an account created moments ago - which is to say, one that has just signed
  // up - is treated as still owing it.
  const bornAt = createdAt ? Date.parse(createdAt) : 0;
  const isNew = bornAt > 0 && Date.now() - bornAt < NEW_ACCOUNT_MS;

  if (isNew) {
    const out: Account = { stage: "onboarding", userId, answers };
    writeMirror(out);
    return out;
  }

  // An established account with no marker predates it. Write one, so this is
  // decided from the account itself from now on rather than from its age.
  void supabase.auth.updateUser({ data: { [DONE_AT]: new Date().toISOString() } }).catch(() => {
    // The mirror still carries it; the next sign-in will try again.
  });
  const out: Account = { stage: "ready", userId, answers };
  writeMirror(out);
  return out;
}

/** Saves progress through onboarding, so leaving halfway loses nothing. */
export async function saveOnboardingAnswers(answers: Record<string, unknown>) {
  try {
    window.localStorage.setItem(LEGACY_ANSWERS, JSON.stringify(answers));
  } catch {
    // ignore
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.auth.updateUser({ data: { [ANSWERS]: answers } });
}

/**
 * Writes a finished onboarding to the account, once there is an account.
 *
 * Onboarding runs before sign-up - the questions are what make signing up worth
 * doing - so at the moment it finishes there is nobody to attribute it to. This
 * is called on the first SIGNED_IN after that, which is the earliest point the
 * answers have an owner.
 */
export async function flushPendingOnboarding(): Promise<boolean> {
  let pending = false;
  let answers: Record<string, unknown> = {};
  try {
    pending = window.localStorage.getItem(PENDING) === "1";
    answers = JSON.parse(window.localStorage.getItem(LEGACY_ANSWERS) ?? "{}");
  } catch {
    return false;
  }
  if (!pending) return false;

  const written = await completeOnboarding(answers);
  if (!written) return false;
  try {
    window.localStorage.removeItem(PENDING);
  } catch {
    // ignore
  }
  return true;
}

/** Onboarding is finished but nobody has signed up yet. */
export function markOnboardingPending(answers: Record<string, unknown>) {
  try {
    window.localStorage.setItem(PENDING, "1");
    window.localStorage.setItem(LEGACY_ANSWERS, JSON.stringify(answers));
    window.localStorage.setItem(LEGACY_DONE, "1");
  } catch {
    // ignore
  }
}

/**
 * Marks onboarding done, on the account.
 *
 * The mirror is written first and unconditionally. If the network call fails
 * the student still gets through - being shown onboarding twice is a bad day,
 * being stuck in it is a lost account.
 */
export async function completeOnboarding(answers: Record<string, unknown>): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id ?? null;
  writeMirror({ stage: userId ? "ready" : "visitor", userId, answers });

  if (!userId) return false;
  await supabase.auth.updateUser({
    data: { [DONE_AT]: new Date().toISOString(), [ANSWERS]: answers },
  });
  return true;
}
