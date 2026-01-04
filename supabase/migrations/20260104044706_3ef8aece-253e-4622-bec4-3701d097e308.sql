-- Fix overly permissive RLS policies on chat_sessions and chat_messages
-- Edge functions use service_role which bypasses RLS, so restricting these won't break widget functionality

-- Drop overly permissive policies on chat_sessions
DROP POLICY IF EXISTS "Anyone can view chat sessions by token" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.chat_sessions;

-- Create restricted policies for chat_sessions
-- Chatbot owners can view their chatbot's sessions (for analytics/dashboard)
CREATE POLICY "Chatbot owners can view sessions" ON public.chat_sessions
  FOR SELECT USING (
    chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
  );

-- Chatbot owners can update their chatbot's sessions
CREATE POLICY "Chatbot owners can update sessions" ON public.chat_sessions
  FOR UPDATE USING (
    chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
  );

-- Chatbot owners can create sessions for their chatbots
CREATE POLICY "Chatbot owners can create sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (
    chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
  );

-- Drop overly permissive policies on chat_messages
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;

-- Create restricted policies for chat_messages
-- Only allow viewing messages from sessions of owned chatbots
CREATE POLICY "Chatbot owners can view messages" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT cs.id FROM public.chat_sessions cs
      JOIN public.chatbots cb ON cs.chatbot_id = cb.id
      WHERE cb.user_id = auth.uid()
    )
  );

-- Only allow inserting messages to sessions of owned chatbots
CREATE POLICY "Chatbot owners can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT cs.id FROM public.chat_sessions cs
      JOIN public.chatbots cb ON cs.chatbot_id = cb.id
      WHERE cb.user_id = auth.uid()
    )
  );