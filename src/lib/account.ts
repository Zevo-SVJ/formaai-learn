import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/**
 * Who the person in front of the app is, and how far they have got.
 *
 * The app used to answer this from a localStorage key. That is browser state,
 * not account state: the same student on a second device was a stranger, shown
 * the landing, walked through onboarding again and asked to create an account
 * they already had.
 *
 * The account is the truth now. localStorage stays, but only as a mirror - it
 * makes the first paint after a reload correct instead of blank, and it is
 * overwritten by the server's answer the moment that arrives.
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

/** The last answer this browser saw. Right often enough to render with, and
 *  never used to decide anything the server has since answered. */
export function cachedAccount(): Account {
  if (typeof window === "undefined") return { stage: "visitor", userId: null, answers: {} };
  const m = readMirror();
  if (m) return m;
  // Somebody who onboarded before this existed. Believe the old key rather
  // than send them round again, and let the server correct it in a moment.
  const legacy = window.localStorage.getItem(LEGACY_DONE) === "1";
  return { stage: legacy ? "ready" : "visitor", userId: null, answers: {} };
}

/**
 * Asks the account itself.
 *
 * A missing profiles table is treated as "not onboarded yet" rather than as an
 * error: the migration ships with this code but is applied separately, and for
 * the window between the two the app has to keep working. Anyone who onboarded
 * on this browser is still recognised from the mirror in that window.
 */
export async function loadAccount(): Promise<Account> {
  let userId: string | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) userId = data.user?.id ?? null;
  } catch {
    // A Web Locks timeout, most likely. Treated as signed out, same as the
    // route guard does.
  }

  if (!userId) {
    const out: Account = { stage: "visitor", userId: null, answers: {} };
    writeMirror(out);
    return out;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarded_at, onboarding_answers")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Fall back to what this browser remembers, so a signed-in student is not
    // thrown back into onboarding because a query failed.
    const cached = cachedAccount();
    const out: Account = {
      stage: cached.stage === "ready" ? "ready" : "onboarding",
      userId,
      answers: cached.answers,
    };
    writeMirror(out);
    return out;
  }

  const out: Account = {
    stage: data?.onboarded_at ? "ready" : "onboarding",
    userId,
    answers: (data?.onboarding_answers as Record<string, unknown>) ?? {},
  };
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
  const userId = data.user?.id;
  if (!userId) return;
  await supabase
    .from("profiles")
    .upsert({ user_id: userId, onboarding_answers: answers as Json }, { onConflict: "user_id" });
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

  await completeOnboarding(answers);
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
export async function completeOnboarding(answers: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id ?? null;
  writeMirror({ stage: userId ? "ready" : "visitor", userId, answers });

  if (!userId) return;
  await supabase.from("profiles").upsert(
    {
      user_id: userId,
      onboarded_at: new Date().toISOString(),
      onboarding_answers: answers as Json,
    },
    { onConflict: "user_id" },
  );
}
