
-- Grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  assignment TEXT,
  grade NUMERIC(8,3) NOT NULL,
  max_grade NUMERIC(8,3) NOT NULL DEFAULT 20,
  coefficient NUMERIC(6,3) NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own grades" ON public.grades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_grades_updated BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX grades_user_date_idx ON public.grades(user_id, date DESC);
CREATE INDEX grades_user_subject_idx ON public.grades(user_id, subject);

-- Referrals: user profile with unique code + referrer tracking
CREATE TABLE public.referral_profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  premium_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referral_profiles TO authenticated;
GRANT ALL ON public.referral_profiles TO service_role;
ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;
-- Users can read/update their own profile
CREATE POLICY "own referral profile read" ON public.referral_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own referral profile insert" ON public.referral_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own referral profile update" ON public.referral_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_ref_profiles_updated BEFORE UPDATE ON public.referral_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Function to lookup referrer by code (bypasses RLS via SECURITY DEFINER, returns only the user_id)
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.referral_profiles WHERE code = upper(_code) LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_referrer_by_code(TEXT) TO authenticated;

-- Function to count successful referrals for current user
CREATE OR REPLACE FUNCTION public.my_referral_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.referral_profiles WHERE referred_by = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.my_referral_count() TO authenticated;
