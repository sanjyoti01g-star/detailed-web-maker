-- Fix #1: Secure the setup_admin_by_email function to prevent privilege escalation
-- This function previously allowed ANY user to grant admin privileges to any email

-- First, revoke public access to the function
REVOKE ALL ON FUNCTION public.setup_admin_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.setup_admin_by_email(text) FROM authenticated;
REVOKE ALL ON FUNCTION public.setup_admin_by_email(text) FROM anon;

-- Replace the function with proper authorization checks
CREATE OR REPLACE FUNCTION public.setup_admin_by_email(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  admin_exists boolean;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check if any admins already exist
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO admin_exists;
  
  -- If admins exist, caller must be an admin
  IF admin_exists THEN
    IF NOT has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only admins can create new admins';
    END IF;
  END IF;
  -- If no admins exist, the first authenticated user can become admin (first-time setup)
  
  -- Validate email format (defense-in-depth)
  IF admin_email IS NULL OR admin_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Get user_id from profiles by email
  SELECT user_id INTO target_user_id
  FROM public.profiles
  WHERE LOWER(email) = LOWER(TRIM(admin_email));
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Fix #2: Update handle_new_user trigger to validate email (defense-in-depth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_full_name text;
  safe_email text;
BEGIN
  -- Validate and sanitize email
  safe_email := NULLIF(TRIM(LOWER(NEW.email)), '');
  
  -- Validate email format (defense-in-depth, Supabase already validates)
  IF safe_email IS NOT NULL AND safe_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    safe_email := NULL;
  END IF;
  
  -- Validate and sanitize full_name
  safe_full_name := trim(COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Enforce length limit (100 characters max)
  IF length(safe_full_name) > 100 THEN
    safe_full_name := substring(safe_full_name, 1, 100);
  END IF;
  
  -- Remove potential injection characters
  safe_full_name := regexp_replace(safe_full_name, '[<>"]', '', 'g');
  
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, safe_email, NULLIF(safe_full_name, ''));
  
  RETURN NEW;
END;
$$;