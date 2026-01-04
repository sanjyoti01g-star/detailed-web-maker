import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Eye, Settings, FileText, Palette, Brain, Code, Upload, Globe, Plus, X, GripVertical, Copy, Check, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'training', label: 'Training Data', icon: FileText },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'personality', label: 'Personality', icon: Brain },
  { id: 'embed', label: 'Embed', icon: Code },
];

const industries = ['Customer Support', 'Sales', 'Education', 'Healthcare', 'E-commerce', 'Real Estate', 'Finance', 'HR & Recruitment', 'IT Support', 'Other'];
const avatars = ['🤖', '💬', '🎯', '🚀', '💡', '⭐', '🔥', '💎'];

interface ChatbotData {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  template_type: string;
  system_prompt: string | null;
  is_active: boolean;
  embed_token: string;
  settings: unknown;
}

export default function BotBuilder() {
  const navigate = useNavigate();
  const { botId } = useParams();
  const { user } = useAuth();
  const isNew = botId === 'new';

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // Chatbot data
  const [chatbot, setChatbot] = useState<ChatbotData | null>(null);
  const [botName, setBotName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🤖');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [starters, setStarters] = useState(['What services do you offer?', 'How can I contact support?', 'What are your business hours?']);
  const [primaryColor, setPrimaryColor] = useState('#6750a4');

  useEffect(() => {
    if (!isNew && botId) {
      fetchChatbot();
    }
  }, [botId, isNew]);

  const fetchChatbot = async () => {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', botId)
      .single();

    if (error) {
      console.error('Error fetching chatbot:', error);
      toast.error('Failed to load chatbot');
      navigate('/chatbots');
      return;
    }

    if (data) {
      setChatbot(data);
      setBotName(data.name);
      setDescription(data.description || '');
      setIndustry(data.template_type || '');
      setSelectedAvatar(data.avatar || '🤖');
      setSystemPrompt(data.system_prompt || '');
      
      // Parse settings for starters and colors
      const settings = data.settings as Record<string, unknown> | null;
      if (settings?.starters && Array.isArray(settings.starters)) {
        setStarters(settings.starters as string[]);
      }
      if (settings?.primaryColor && typeof settings.primaryColor === 'string') {
        setPrimaryColor(settings.primaryColor);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save');
      return;
    }

    if (!botName.trim()) {
      toast.error('Please enter a bot name');
      return;
    }

    setSaving(true);

    const chatbotData = {
      name: botName.trim(),
      description: description.trim() || null,
      avatar: selectedAvatar,
      template_type: industry || 'custom',
      system_prompt: systemPrompt.trim() || null,
      settings: {
        starters,
        primaryColor,
      },
    };

    try {
      if (isNew) {
        // Create new chatbot
        const { data, error } = await supabase
          .from('chatbots')
          .insert({
            ...chatbotData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Chatbot created successfully!');
        // Navigate to the new chatbot's edit page
        navigate(`/chatbots/${data.id}`, { replace: true });
      } else {
        // Update existing chatbot
        const { error } = await supabase
          .from('chatbots')
          .update(chatbotData)
          .eq('id', botId);

        if (error) throw error;

        toast.success('Changes saved!');
        // Refresh chatbot data
        fetchChatbot();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save chatbot');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get the actual chatbot ID (either from loaded data or null for new)
  const actualBotId = chatbot?.id || null;

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
              {chatbot && (
                <span className={cn(
                  "text-sm flex items-center gap-1",
                  chatbot.is_active ? "text-success" : "text-warning"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    chatbot.is_active ? "bg-success" : "bg-warning"
                  )} />
                  {chatbot.is_active ? 'Active' : 'Paused'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {actualBotId && (
            <Button variant="outline" onClick={() => navigate(`/chat-preview/${actualBotId}`)}>
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isNew ? 'Create Bot' : 'Save Changes'}
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
          <TrainingTab botId={actualBotId} isNew={isNew || !actualBotId} />
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
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Describe your bot's personality, expertise, and how it should interact with users..."
                  className="mt-1.5 min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt will guide how your bot responds to users.
                </p>
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
          <EmbedTab botId={actualBotId} isNew={isNew || !actualBotId} embedToken={chatbot?.embed_token} />
        )}
      </div>
    </div>
  );
}

// Training Tab Component with document upload
interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  status: string;
  error_message: string | null;
  created_at: string;
  file_path: string;
}

function TrainingTab({ botId, isNew }: { botId: string | null; isNew: boolean }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (botId && !isNew) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [botId, isNew]);

  const fetchDocuments = async () => {
    if (!botId) return;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: false });

    if (data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error('Please sign in to upload documents');
      return;
    }
    if (!botId || isNew) {
      toast.error('Please save the chatbot first before uploading documents');
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/json', 'text/markdown'];
      const allowedExtensions = ['.pdf', '.txt', '.csv', '.json', '.md'];
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        toast.error(`${file.name} is not a supported file type.`);
        continue;
      }

      try {
        // Upload to storage
        const filePath = `${user.id}/${botId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Create document record
        const { data: docRecord, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            chatbot_id: botId,
            name: file.name,
            file_path: filePath,
            file_type: file.type || ext.slice(1),
            file_size: file.size,
            status: 'pending',
          })
          .select()
          .single();

        if (docError || !docRecord) {
          console.error('Document record error:', docError);
          toast.error(`Failed to create record for ${file.name}`);
          continue;
        }

        // Add to local state immediately
        setDocuments(prev => [docRecord, ...prev]);

        // Trigger document processing
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: docRecord.id,
              filePath,
              fileType: file.type || ext.slice(1),
            }),
          }).then(async (response) => {
            if (response.ok) {
              // Refresh documents to get updated status
              fetchDocuments();
              toast.success(`${file.name} processed successfully`);
            } else {
              const error = await response.json();
              console.error('Processing error:', error);
              fetchDocuments(); // Refresh to show failed status
            }
          }).catch(err => {
            console.error('Processing request error:', err);
            fetchDocuments();
          });
        }

        toast.success(`${file.name} uploaded, processing...`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!user || !botId) return;

    try {
      // Delete from storage using the stored file_path
      await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      // Delete record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        toast.error('Failed to delete document');
        return;
      }

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (isNew || !botId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Save Your Bot First</h3>
          <p className="text-muted-foreground">
            You need to save your chatbot before you can upload training documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.csv,.json,.md,text/plain,application/pdf,text/csv,application/json,text/markdown"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div 
            className={cn(
              "border-2 border-dashed border-border rounded-xl p-8 text-center transition-colors cursor-pointer",
              uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"
            )}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            )}
            <p className="text-foreground font-medium mb-1">
              {uploading ? 'Uploading...' : 'Drag & drop files here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">PDF, TXT, CSV, JSON, MD (Max 10MB per file)</p>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : documents.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)} • {doc.file_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(doc.status)}
                      <span className={cn(
                        "text-xs capitalize",
                        doc.status === 'processed' && "text-success",
                        doc.status === 'failed' && "text-destructive",
                        (doc.status === 'pending' || doc.status === 'processing') && "text-warning"
                      )}>
                        {doc.status}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add Website URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Enter website URL to crawl (coming soon)" className="pl-9" disabled />
            </div>
            <Button disabled>Add URL</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Website crawling feature coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component for Embed tab with its own state
function EmbedTab({ botId, isNew, embedToken }: { botId: string | null; isNew: boolean; embedToken?: string }) {
  const [copied, setCopied] = useState<'script' | 'iframe' | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const scriptEmbedCode = embedToken
    ? `<script src="${supabaseUrl}/functions/v1/widget?token=${embedToken}"></script>`
    : '';

  const iframeEmbedCode = embedToken
    ? `<iframe 
  src="${supabaseUrl}/functions/v1/widget?token=${embedToken}&format=iframe"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
  allow="microphone"
></iframe>`
    : '';

  const copyCode = (code: string, type: 'script' | 'iframe') => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  if (isNew || !botId || !embedToken) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Save Your Bot First</h3>
          <p className="text-muted-foreground">
            You need to save your chatbot before you can get the embed code.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JavaScript Embed (Recommended)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add this script tag to your website. The widget will appear automatically.
          </p>
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
              <code>{scriptEmbedCode}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 gap-1"
              onClick={() => copyCode(scriptEmbedCode, 'script')}
            >
              {copied === 'script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'script' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>iFrame Embed (Alternative)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use this if you prefer an iframe-based embed.
          </p>
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              <code>{iframeEmbedCode}</code>
            </pre>
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 gap-1"
              onClick={() => copyCode(iframeEmbedCode, 'iframe')}
            >
              {copied === 'iframe' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied === 'iframe' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Your Embed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Try your embed code on our demo page to see how it looks on an external website.
          </p>
          <Button variant="outline" asChild>
            <a href="/demo-embed" target="_blank" rel="noopener noreferrer">
              Open Demo Embed Page
            </a>
          </Button>
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
  );
}
