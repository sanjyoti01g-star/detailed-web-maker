-- Add plan and credit tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS credits_balance integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS bot_limit integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS storage_limit_mb integer NOT NULL DEFAULT 10;

-- Create check_and_deduct_credit function
CREATE OR REPLACE FUNCTION public.check_and_deduct_credit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Get current balance with row-level lock for concurrency safety
  SELECT credits_balance INTO current_balance 
  FROM public.profiles 
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Return false if user not found
  IF current_balance IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has credits
  IF current_balance > 0 THEN
    UPDATE public.profiles 
    SET credits_balance = credits_balance - 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;