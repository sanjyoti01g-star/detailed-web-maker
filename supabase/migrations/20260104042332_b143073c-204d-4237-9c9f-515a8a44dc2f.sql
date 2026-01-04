-- Add DELETE policy for chat_sessions to allow proper data cleanup (GDPR compliance)
CREATE POLICY "Chatbot owners can delete sessions" ON public.chat_sessions
  FOR DELETE USING (
    chatbot_id IN (
      SELECT id FROM public.chatbots WHERE user_id = auth.uid()
    )
  );

-- Create function to cleanup old sessions (for scheduled cleanup if needed)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.chat_sessions
  WHERE last_activity_at < now() - interval '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Update handle_new_user function to sanitize input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_full_name text;
BEGIN
  -- Validate and sanitize full_name
  safe_full_name := trim(COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Enforce length limit (100 characters max)
  IF length(safe_full_name) > 100 THEN
    safe_full_name := substring(safe_full_name, 1, 100);
  END IF;
  
  -- Remove potential injection characters
  safe_full_name := regexp_replace(safe_full_name, '[<>"]', '', 'g');
  
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(safe_full_name, ''));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;