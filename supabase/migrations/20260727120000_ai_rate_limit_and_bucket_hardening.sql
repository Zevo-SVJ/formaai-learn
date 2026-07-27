-- Two launch-blocking protections, both idempotent.
--
-- 1. A per-user quota on the AI endpoints. Without it, one signed-in account can
--    loop analyze/chat and burn the whole AI budget. Counting lives in Postgres
--    rather than in the worker because the app runs on Cloudflare: each isolate
--    has its own memory, so an in-process counter would reset constantly and
--    protect nothing.
--
-- 2. The documents bucket is enforced private, with a size cap and an allow-list
--    of mime types. It was created through the dashboard, so nothing in the repo
--    guaranteed those settings; this makes them declarative and reproducible.

-- ---------------------------------------------------------------- rate limit

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_user_kind_time_idx
  ON public.ai_usage (user_id, kind, created_at DESC);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- No direct client access at all: the counter is only ever touched through the
-- SECURITY DEFINER function below, so a user cannot read, forge or delete their
-- own usage rows to reset a quota.
REVOKE ALL ON public.ai_usage FROM anon, authenticated;
GRANT ALL ON public.ai_usage TO service_role;

/*
  Records one AI call for the current user and reports whether it is allowed.

  Returns TRUE when the call may proceed, FALSE when the quota is spent. The
  insert only happens on success, so a blocked user does not push their own
  window further out by retrying.
*/
CREATE OR REPLACE FUNCTION public.consume_ai_quota(
  _kind TEXT,
  _limit INT,
  _window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
  used INT;
BEGIN
  uid := auth.uid();
  -- Anonymous callers never reach the AI endpoints, but fail closed anyway.
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  IF _kind IS NULL OR _limit IS NULL OR _limit <= 0 OR _window_seconds IS NULL OR _window_seconds <= 0 THEN
    RETURN FALSE;
  END IF;

  -- Bounded, cheap housekeeping: only this user's rows, only old ones.
  DELETE FROM public.ai_usage
   WHERE user_id = uid
     AND created_at < now() - INTERVAL '1 day';

  SELECT count(*) INTO used
    FROM public.ai_usage
   WHERE user_id = uid
     AND kind = _kind
     AND created_at > now() - make_interval(secs => _window_seconds);

  IF used >= _limit THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.ai_usage (user_id, kind) VALUES (uid, _kind);
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_ai_quota(TEXT, INT, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(TEXT, INT, INT) TO authenticated;

-- ------------------------------------------------------------ bucket config

-- Private, 25 MB ceiling (the client refuses at 20 MB, so this is the backstop
-- a crafted request cannot talk its way past), and only the types Forma can
-- actually read. Executables and archives are rejected by storage itself.
UPDATE storage.buckets
   SET public = FALSE,
       file_size_limit = 26214400, -- 25 MiB
       allowed_mime_types = ARRAY[
         'image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif',
         'application/pdf','text/plain','text/markdown'
       ]
 WHERE id = 'documents';
