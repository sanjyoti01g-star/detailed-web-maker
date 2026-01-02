import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt API key
async function decryptKey(encryptedKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  
  const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

// Provider-specific API handlers
async function callOpenAI(apiKey: string, messages: any[], model: string): Promise<Response> {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages,
      stream: true,
    }),
  });
}

async function callGemini(apiKey: string, messages: any[], model: string): Promise<Response> {
  const geminiModel = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?key=${apiKey}`;
  
  // Convert OpenAI format to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const systemInstruction = messages.find(m => m.role === 'system');

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction.content }] } : undefined,
    }),
  });
}

async function callAnthropic(apiKey: string, messages: any[], model: string): Promise<Response> {
  const systemMessage = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: chatMessages,
      stream: true,
    }),
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionSecret = supabaseServiceKey.slice(0, 32);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { embedToken, sessionToken, message, messages: providedMessages } = await req.json();

    if (!embedToken) {
      return new Response(JSON.stringify({ error: 'Embed token required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get chatbot by embed token
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('embed_token', embedToken)
      .eq('is_active', true)
      .single();

    if (chatbotError || !chatbot) {
      console.error('Chatbot not found:', chatbotError);
      return new Response(JSON.stringify({ error: 'Chatbot not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's API key for this provider
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('user_id', chatbot.user_id)
      .eq('provider', chatbot.provider)
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error('API key not found:', apiKeyError);
      return new Response(JSON.stringify({ error: 'API key not configured for this provider' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt API key
    const decryptedApiKey = await decryptKey(apiKeyData.encrypted_key, encryptionSecret);

    // Get or create session
    let session;
    if (sessionToken) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('chatbot_id', chatbot.id)
        .single();
      session = data;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          chatbot_id: chatbot.id,
          visitor_id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      session = newSession;
    }

    // Update session activity
    await supabase
      .from('chat_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);

    // Build messages array
    const systemPrompt = chatbot.system_prompt || 'You are a helpful assistant.';
    let allMessages = [{ role: 'system', content: systemPrompt }];

    if (providedMessages && providedMessages.length > 0) {
      allMessages = [...allMessages, ...providedMessages];
    } else if (message) {
      // Get previous messages from session
      const { data: prevMessages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (prevMessages) {
        allMessages = [...allMessages, ...prevMessages];
      }
      allMessages.push({ role: 'user', content: message });

      // Save user message
      await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          role: 'user',
          content: message,
        });
    }

    console.log(`Chat request for bot ${chatbot.id}, provider ${chatbot.provider}, session ${session.id}`);

    // Call appropriate AI provider
    let aiResponse: Response;
    switch (chatbot.provider) {
      case 'openai':
        aiResponse = await callOpenAI(decryptedApiKey, allMessages, chatbot.model);
        break;
      case 'gemini':
        aiResponse = await callGemini(decryptedApiKey, allMessages, chatbot.model);
        break;
      case 'anthropic':
        aiResponse = await callAnthropic(decryptedApiKey, allMessages, chatbot.model);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unsupported provider' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI provider error', details: errorText }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return streaming response with session token
    const headers = {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'X-Session-Token': session.session_token,
    };

    return new Response(aiResponse.body, { headers });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
