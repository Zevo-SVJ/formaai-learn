-- Harden the SECURITY DEFINER functions flagged by the Supabase database linter.
--
-- Cause of the warnings: Postgres grants EXECUTE on a newly created function to
-- PUBLIC by default, and both `anon` and `authenticated` inherit PUBLIC. So the
-- two referral helpers were callable over PostgREST by anonymous visitors. The
-- explicit `GRANT EXECUTE ... TO authenticated` in the original migration was
-- redundant; it never narrowed anything.
--
-- Both functions keep SECURITY DEFINER on purpose. They read referral_profiles
-- rows belonging to *other* users, which the "own referral profile read" policy
-- (auth.uid() = user_id) intentionally hides. Neither returns more than the
-- caller is meant to learn, and both are re-scoped below so they cannot be used
-- to read anything else.

-- ---------------------------------------------------------------------------
-- get_referrer_by_code(text)
--
-- Used by redeemReferralCode to turn a friend's code into that friend's user id.
-- Runs with the signed-in user's JWT, so `authenticated` needs EXECUTE.
-- `anon` never does: without a grant, a stranger cannot walk the code space to
-- harvest user ids.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id
  FROM public.referral_profiles
  WHERE code = upper(_code)
    -- Defence in depth: stay inert for unauthenticated sessions even if the
    -- grants below are ever loosened again, and never resolve to the caller
    -- (redeeming your own code was already rejected in application code).
    AND auth.uid() IS NOT NULL
    AND user_id <> auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_referrer_by_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_referrer_by_code(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_referrer_by_code(TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- my_referral_count()
--
-- Counts how many people signed up with the caller's code. The count lives
-- behind SECURITY DEFINER because those rows belong to the referred friends,
-- not to the caller. The body is scoped to auth.uid(), so a caller can only
-- ever count their own referrals - there is no argument to point elsewhere.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.my_referral_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.referral_profiles
  WHERE auth.uid() IS NOT NULL
    AND referred_by = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_referral_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_referral_count() FROM anon;
GRANT EXECUTE ON FUNCTION public.my_referral_count() TO authenticated;

-- ---------------------------------------------------------------------------
-- Verification
--
-- This migration only covers the SECURITY DEFINER functions that exist in this
-- repository. The linter runs against the live database, which can also hold
-- objects created through the dashboard. Run this in the SQL editor to list
-- every SECURITY DEFINER function in public together with who may execute it,
-- and confirm nothing unexpected is reachable by anon:
--
--   SELECT p.proname,
--          pg_get_function_identity_arguments(p.oid) AS args,
--          p.prosecdef                               AS security_definer,
--          has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon_can_execute,
--          has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authed_can_execute
--   FROM pg_proc p
--   JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.prosecdef
--   ORDER BY p.proname;
--
-- Expected after this migration: both referral functions show
-- anon_can_execute = false, authed_can_execute = true, and no other rows.
-- ---------------------------------------------------------------------------
