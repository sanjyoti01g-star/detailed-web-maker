import { useState } from 'react';
import { ArrowLeft, Save, Eye, Settings, FileText, Palette, Brain, Code, Upload, Globe, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useParams } from 'react-router-dom';
import { mockBots } from '@/data/mockData';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'training', label: 'Training Data', icon: FileText },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'personality', label: 'Personality', icon: Brain },
  { id: 'embed', label: 'Embed', icon: Code },
];

const industries = ['Customer Support', 'Sales', 'Education', 'Healthcare', 'E-commerce', 'Real Estate', 'Finance', 'HR & Recruitment', 'IT Support', 'Other'];
const avatars = ['🤖', '💬', '🎯', '🚀', '💡', '⭐', '🔥', '💎'];

export default function BotBuilder() {
  const navigate = useNavigate();
  const { botId } = useParams();
  const isNew = botId === 'new';
  const bot = !isNew ? mockBots.find((b) => b.id === botId) : null;

  const [activeTab, setActiveTab] = useState('overview');
  const [botName, setBotName] = useState(bot?.name || '');
  const [description, setDescription] = useState(bot?.description || '');
  const [industry, setIndustry] = useState(bot?.category || '');
  const [selectedAvatar, setSelectedAvatar] = useState(bot?.avatar || '🤖');
  const [starters, setStarters] = useState(['What services do you offer?', 'How can I contact support?', 'What are your business hours?']);
  const [primaryColor, setPrimaryColor] = useState('#6750a4');

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chatbots')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedAvatar}</span>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {isNew ? 'Create New Bot' : botName || 'Untitled Bot'}
              </h1>
              <span className="text-sm text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/chat-preview/${botId || 'bot_1'}`)}>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="botName">Bot Name *</Label>
                  <Input
                    id="botName"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    className="mt-1.5"
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your bot will help with..."
                    className="mt-1.5"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
                </div>
                <div>
                  <Label htmlFor="industry">Industry/Category</Label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1.5 w-full h-10 px-3 rounded-lg border border-input bg-background"
                  >
                    <option value="">Select an industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bot Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={cn(
                        'w-14 h-14 text-2xl rounded-xl border-2 transition-all',
                        selectedAvatar === avatar
                          ? 'border-primary bg-primary/10 scale-110'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversation Starters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {starters.map((starter, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <Input
                      value={starter}
                      onChange={(e) => {
                        const newStarters = [...starters];
                        newStarters[index] = e.target.value;
                        setStarters(newStarters);
                      }}
                    />
                    {starters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStarters(starters.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {starters.length < 6 && (
                  <Button variant="ghost" size="sm" onClick={() => setStarters([...starters, ''])}>
                    <Plus className="w-4 h-4" />
                    Add Starter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-1">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, CSV (Max 10MB per file)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Website URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Enter website URL to crawl" className="pl-9" />
                  </div>
                  <Button>Add URL</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'appearance' && (
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>
              <div>
                <Label>Widget Position</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-w-xs">
                  {['Bottom Right', 'Bottom Left', 'Top Right', 'Top Left'].map((pos) => (
                    <button
                      key={pos}
                      className="p-3 text-sm border border-border rounded-lg hover:border-primary/50 focus:border-primary"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'personality' && (
          <Card>
            <CardHeader>
              <CardTitle>Bot Personality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="persona">Persona Description</Label>
                <Textarea
                  id="persona"
                  placeholder="Describe your bot's personality, expertise, and how it should interact with users..."
                  className="mt-1.5 min-h-[150px]"
                />
              </div>
              <div>
                <Label>Tone</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {['Professional', 'Friendly', 'Casual', 'Formal', 'Empathetic'].map((tone) => (
                    <button key={tone} className="p-3 text-sm border border-border rounded-lg hover:border-primary/50">
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript Embed (Recommended)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  <code>{`<script>
  (function(w,d,s,o,f,js,fjs){
    w['ChatBotWidget']=o;
    js = d.createElement(s);
    js.id = o; js.src = f; js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'chatbot', 
    'https://cdn.chatbot.ai/widget.js'));
  chatbot('init', { botId: '${botId || 'bot_new'}' });
</script>`}</code>
                </pre>
                <Button variant="outline" className="mt-4">Copy Code</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Whitelist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Only these domains can embed your chatbot
                </p>
                <div className="flex gap-2">
                  <Input placeholder="https://example.com" />
                  <Button>Add Domain</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
