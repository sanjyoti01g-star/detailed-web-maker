import { useState } from 'react';
import { ArrowLeft, Send, RotateCcw, Bug, Info, Activity, TestTube, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockConversations, mockBots } from '@/data/mockData';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const debugTabs = ['Context', 'Metadata', 'Session', 'Test Scenarios'];

export default function ChatPreview() {
  const navigate = useNavigate();
  const { botId } = useParams();
  const bot = mockBots.find((b) => b.id === botId) || mockBots[0];
  
  const [messages, setMessages] = useState(mockConversations);
  const [input, setInput] = useState('');
  const [activeDebugTab, setActiveDebugTab] = useState('Context');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', text: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Thanks for your message! I'm here to help. Is there anything specific you'd like to know?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 1500);
  };

  const resetConversation = () => {
    setMessages(mockConversations);
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chatbots')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{bot.avatar}</span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{bot.name}</h1>
            <span className="text-sm text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* Chat Panel */}
        <Card className="lg:col-span-3 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xl">
                  {bot.avatar}
                </div>
                <div>
                  <p className="font-medium">{bot.name}</p>
                  <p className="text-xs text-primary-foreground/70">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-2',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{bot.avatar}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-end">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">{bot.avatar}</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <Button variant="ghost" size="sm" className="mt-2" onClick={resetConversation}>
                <RotateCcw className="w-4 h-4" />
                Reset Conversation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <Card className="lg:col-span-2 flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="w-4 h-4" />
              Debug Panel
            </CardTitle>
          </CardHeader>
          <div className="px-4 pb-2">
            <div className="flex gap-1 overflow-x-auto">
              {debugTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDebugTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                    activeDebugTab === tab
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <CardContent className="flex-1 overflow-y-auto text-sm space-y-4 min-h-0">
            {activeDebugTab === 'Context' && (
              <>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Current Message Analysis</h4>
                  <p className="text-muted-foreground text-xs mb-3">User Input: "What are your business hours?"</p>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">🎯 Intent</span>
                      <span className="font-medium text-foreground">business_hours_inquiry</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">📊 Confidence</span>
                      <span className="font-medium text-success">94%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Matched Training Data</h4>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
                    <p><span className="text-muted-foreground">📄 Source:</span> FAQ Document.pdf</p>
                    <p><span className="text-muted-foreground">📍 Page:</span> 3</p>
                    <p><span className="text-muted-foreground">✅ Relevance:</span> 0.89</p>
                  </div>
                </div>
              </>
            )}
            {activeDebugTab === 'Metadata' && (
              <>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Response Performance</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">⏱️ Response Time</span>
                      <span className="font-medium text-foreground">847ms</span>
                    </div>
                    <div className="pl-4 text-muted-foreground">
                      <p>├── Intent classification: 124ms</p>
                      <p>├── Context retrieval: 312ms</p>
                      <p>├── LLM generation: 389ms</p>
                      <p>└── Formatting: 22ms</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Token Usage</h4>
                  <div className="space-y-1 text-xs">
                    <p>Prompt tokens: 234</p>
                    <p>Completion tokens: 47</p>
                    <p>Total: 281 tokens</p>
                    <p className="text-muted-foreground mt-2">💰 Cost: $0.0003</p>
                  </div>
                </div>
              </>
            )}
            {activeDebugTab === 'Session' && (
              <div className="space-y-2 text-xs">
                <p><span className="text-muted-foreground">🆔 Session ID:</span> ses_xk9j2m4n8p</p>
                <p><span className="text-muted-foreground">⏰ Started:</span> {new Date().toLocaleTimeString()}</p>
                <p><span className="text-muted-foreground">⌛ Duration:</span> 3m 42s</p>
                <p><span className="text-muted-foreground">💬 Messages:</span> {messages.length}</p>
                <p><span className="text-muted-foreground">👤 User:</span> Anonymous</p>
                <p><span className="text-muted-foreground">🌍 Location:</span> United States</p>
                <p><span className="text-muted-foreground">📱 Device:</span> Desktop - Chrome</p>
              </div>
            )}
            {activeDebugTab === 'Test Scenarios' && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">Run pre-defined test cases:</p>
                <div className="space-y-2">
                  {['General FAQ Tests', 'Product Inquiry Tests', 'Support Request Tests', 'Edge Case Tests'].map((test) => (
                    <button
                      key={test}
                      className="w-full text-left p-2 rounded-lg border border-border hover:bg-accent/50 text-sm"
                    >
                      {test}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Recent Results:</p>
                  <p className="text-xs text-success">✅ FAQ Test Suite (12/12 passed)</p>
                  <p className="text-xs text-warning">⚠️ Edge Cases (8/10 passed)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
