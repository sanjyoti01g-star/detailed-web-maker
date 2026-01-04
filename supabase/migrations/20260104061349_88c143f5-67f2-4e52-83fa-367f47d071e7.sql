-- Secure cleanup_old_sessions function by revoking public access and requiring admin role
-- Only service_role (edge functions) or admin users can execute this function

-- Revoke execute from public roles
REVOKE ALL ON FUNCTION public.cleanup_old_sessions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_old_sessions() FROM authenticated;
REVOKE ALL ON FUNCTION public.cleanup_old_sessions() FROM anon;

-- Replace the function with an authorization check
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Only allow admins to run this function
  -- Note: Service role bypasses this check (which is intended for scheduled jobs)
  IF auth.uid() IS NOT NULL AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  DELETE FROM public.chat_sessions
  WHERE last_activity_at < now() - interval '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;