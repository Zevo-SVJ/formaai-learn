const KEY = "forma:pendingReferral";

/**
 * A referral code typed on the sign-up form outlives the sign-up itself.
 *
 * Redemption needs a session, and a session does not exist at the moment the
 * form is submitted: email sign-ups wait for the confirmation link, and OAuth
 * leaves the page entirely. So the code is parked here and redeemed once the
 * session actually arrives, wherever the user lands.
 */
export function storePendingReferral(code: string): void {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return;
  try {
    window.localStorage.setItem(KEY, trimmed);
  } catch {
    // Private mode or blocked storage: the referral is optional, so drop it.
  }
}

/** Reads the parked code and clears it, so redemption is attempted once. */
export function takePendingReferral(): string | null {
  try {
    const code = window.localStorage.getItem(KEY);
    if (code) window.localStorage.removeItem(KEY);
    return code;
  } catch {
    return null;
  }
}
