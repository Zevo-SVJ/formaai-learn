-- Where a student's account state lives.
--
-- Until now the only record that onboarding had happened was a localStorage
-- key. That is not account state, it is browser state: the same person on a
-- second device, or after clearing their data, was treated as somebody who had
-- never signed up - shown the landing, walked through onboarding again, and
-- asked to create an account they already had.
--
-- One row per user, readable and writable only by that user.

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Null until onboarding is finished. A timestamp rather than a boolean: it
  -- answers "has this happened" just as well, and also "when", which a boolean
  -- can never be asked afterwards.
  onboarded_at TIMESTAMPTZ,
  -- What onboarding asked: name, goal, grade, country, subjects. Kept so the
  -- answers survive a device change like everything else here, and so a
  -- half-finished onboarding can be resumed rather than restarted.
  onboarding_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile read" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
