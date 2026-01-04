-- Revoke public execute permission on setup_admin_by_email
-- This function should only be callable by postgres/admin, not by regular users
REVOKE EXECUTE ON FUNCTION public.setup_admin_by_email(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.setup_admin_by_email(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_admin_by_email(text) FROM anon;

-- Grant execute only to service_role (used by edge functions with service role key)
GRANT EXECUTE ON FUNCTION public.setup_admin_by_email(text) TO service_role;