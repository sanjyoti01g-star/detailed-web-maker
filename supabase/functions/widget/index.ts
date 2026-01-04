import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML escape function to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate that avatar is a safe emoji (single emoji character)
function getSafeAvatar(avatar: string | null, defaultEmoji: string): string {
  if (!avatar) return defaultEmoji;
  // Check if it's a single emoji (basic check for emoji unicode ranges)
  const emojiRegex = /^[\p{Emoji}]$/u;
  // For compound emojis, check reasonable length and no script characters
  const isSafeEmoji = avatar.length <= 8 && !/[<>"'&;(){}[\]\\]/.test(avatar);
  return isSafeEmoji ? avatar : defaultEmoji;
}

// Escape for JavaScript string context
function escapeJsString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const embedToken = url.searchParams.get('token');
    const format = url.searchParams.get('format') || 'script';

    if (!embedToken) {
      return new Response('Missing token parameter', { status: 400 });
    }

    // Validate embed token format (should be hex-encoded)
    if (!/^[a-f0-9]+$/i.test(embedToken)) {
      return new Response('Invalid token format', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get chatbot info
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('id, name, avatar, description, settings, is_active')
      .eq('embed_token', embedToken)
      .single();

    if (error || !chatbot) {
      console.error('Chatbot not found:', error);
      return new Response('Chatbot not found', { status: 404 });
    }

    if (!chatbot.is_active) {
      return new Response('Chatbot is inactive', { status: 403 });
    }

    const chatEndpoint = `${supabaseUrl}/functions/v1/chat`;
    const settings = chatbot.settings || {};

    // Get safe values for interpolation
    const safeAvatar = getSafeAvatar(chatbot.avatar, '🤖');
    const safeName = escapeHtml(chatbot.name || 'Chat Assistant');
    const safeWelcomeMessage = escapeHtml(settings.welcomeMessage || 'Hello! How can I help you today?');
    const safePrimaryColor = /^#[a-f0-9]{6}$/i.test(settings.primaryColor || '') 
      ? settings.primaryColor 
      : '#6366f1';

    if (format === 'iframe') {
      // Return embeddable HTML page with CSP
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src ${escapeHtml(supabaseUrl)};">
  <title>${safeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }
    .header { padding: 16px; background: ${safePrimaryColor}; color: white; display: flex; align-items: center; gap: 12px; }
    .avatar { font-size: 24px; }
    .title { font-weight: 600; }
    .messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .message { max-width: 80%; padding: 12px 16px; border-radius: 16px; line-height: 1.5; }
    .user { align-self: flex-end; background: ${safePrimaryColor}; color: white; border-bottom-right-radius: 4px; }
    .assistant { align-self: flex-start; background: white; border: 1px solid #e5e5e5; border-bottom-left-radius: 4px; }
    .input-area { padding: 16px; background: white; border-top: 1px solid #e5e5e5; display: flex; gap: 8px; }
    input { flex: 1; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 24px; outline: none; font-size: 14px; }
    input:focus { border-color: ${safePrimaryColor}; }
    button { padding: 12px 24px; background: ${safePrimaryColor}; color: white; border: none; border-radius: 24px; cursor: pointer; font-weight: 500; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .typing { display: flex; gap: 4px; padding: 12px 16px; }
    .typing span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: bounce 1.4s infinite; }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
  </style>
</head>
<body>
  <div class="header">
    <span class="avatar" id="header-avatar"></span>
    <span class="title" id="header-title"></span>
  </div>
  <div class="messages" id="messages">
    <div class="message assistant" id="welcome-message"></div>
  </div>
  <div class="input-area">
    <input type="text" id="input" placeholder="Type a message..." />
    <button id="send">Send</button>
  </div>
  <script>
    // Safe data passed from server
    const CHATBOT_DATA = {
      avatar: '${escapeJsString(safeAvatar)}',
      name: '${escapeJsString(safeName)}',
      welcomeMessage: '${escapeJsString(safeWelcomeMessage)}'
    };
    const embedToken = '${embedToken}';
    const chatEndpoint = '${escapeJsString(chatEndpoint)}';
    let sessionToken = localStorage.getItem('chatSession_' + embedToken);
    let isLoading = false;

    // Set content safely using textContent
    document.getElementById('header-avatar').textContent = CHATBOT_DATA.avatar;
    document.getElementById('header-title').textContent = CHATBOT_DATA.name;
    document.getElementById('welcome-message').textContent = CHATBOT_DATA.welcomeMessage;

    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('input');
    const sendBtn = document.getElementById('send');

    function addMessage(content, role) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      div.textContent = content;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'message assistant typing';
      div.id = 'typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
      const typing = document.getElementById('typing');
      if (typing) typing.remove();
    }

    async function sendMessage() {
      const message = inputEl.value.trim();
      if (!message || isLoading) return;

      isLoading = true;
      sendBtn.disabled = true;
      inputEl.value = '';

      addMessage(message, 'user');
      showTyping();

      try {
        const response = await fetch(chatEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embedToken, sessionToken, message })
        });

        const newSessionToken = response.headers.get('X-Session-Token');
        if (newSessionToken) {
          sessionToken = newSessionToken;
          localStorage.setItem('chatSession_' + embedToken, sessionToken);
        }

        hideTyping();

        if (!response.ok) {
          const error = await response.json();
          addMessage('Sorry, something went wrong. Please try again.', 'assistant');
          console.error('Chat error:', error);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let messageEl = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  if (!messageEl) {
                    messageEl = addMessage(assistantMessage, 'assistant');
                  } else {
                    messageEl.textContent = assistantMessage;
                  }
                }
              } catch (e) {}
            }
          }
        }

        if (!messageEl && assistantMessage) {
          addMessage(assistantMessage, 'assistant');
        }
      } catch (error) {
        hideTyping();
        addMessage('Sorry, I could not connect. Please try again.', 'assistant');
        console.error('Network error:', error);
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        inputEl.focus();
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    // Return JavaScript embed code with safe interpolation
    const safeAvatarJs = escapeJsString(safeAvatar);
    const script = `(function() {
  var EMBED_TOKEN = '${embedToken}';
  var CHAT_ENDPOINT = '${escapeJsString(chatEndpoint)}';
  var WIDGET_URL = '${escapeJsString(supabaseUrl)}/functions/v1/widget?token=${embedToken}&format=iframe';
  var AVATAR = '${safeAvatarJs}';
  
  var style = document.createElement('style');
  style.textContent = '.chatbot-widget-btn { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: ${safePrimaryColor}; color: white; border: none; cursor: pointer; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; transition: transform 0.2s; } .chatbot-widget-btn:hover { transform: scale(1.1); } .chatbot-widget-container { position: fixed; bottom: 90px; right: 20px; width: 380px; height: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 9998; display: none; } .chatbot-widget-container.open { display: block; } .chatbot-widget-container iframe { width: 100%; height: 100%; border: none; } @media (max-width: 480px) { .chatbot-widget-container { width: calc(100% - 40px); height: 70vh; } }';
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.className = 'chatbot-widget-btn';
  btn.textContent = AVATAR;
  document.body.appendChild(btn);

  var container = document.createElement('div');
  container.className = 'chatbot-widget-container';
  var iframe = document.createElement('iframe');
  iframe.src = WIDGET_URL;
  container.appendChild(iframe);
  document.body.appendChild(container);

  btn.addEventListener('click', function() {
    container.classList.toggle('open');
    btn.textContent = container.classList.contains('open') ? '✕' : AVATAR;
  });
})();`;

    return new Response(script, {
      headers: { ...corsHeaders, 'Content-Type': 'application/javascript' },
    });

  } catch (error) {
    console.error('Error in widget function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
