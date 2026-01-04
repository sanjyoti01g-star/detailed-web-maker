import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, MoreHorizontal, Eye, BarChart3, Edit, Copy, Archive, Trash2, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  is_active: boolean;
  template_type: string;
  created_at: string;
  updated_at: string;
}

export default function MyChatbots() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatbots();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchChatbots = async () => {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chatbots:', error);
      toast.error('Failed to load chatbots');
    } else {
      setChatbots(data || []);
    }
    setLoading(false);
  };

  const handleDeleteChatbot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chatbot:', error);
      toast.error('Failed to delete chatbot');
    } else {
      setChatbots(prev => prev.filter(bot => bot.id !== id));
      toast.success('Chatbot deleted');
    }
    setOpenMenu(null);
  };

  const handleDuplicateChatbot = async (bot: Chatbot) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chatbots')
      .insert({
        user_id: user.id,
        name: `${bot.name} (Copy)`,
        description: bot.description,
        avatar: bot.avatar,
        template_type: bot.template_type,
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating chatbot:', error);
      toast.error('Failed to duplicate chatbot');
    } else if (data) {
      setChatbots(prev => [data, ...prev]);
      toast.success('Chatbot duplicated');
    }
    setOpenMenu(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('chatbots')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating chatbot:', error);
      toast.error('Failed to update chatbot');
    } else {
      setChatbots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, is_active: !currentStatus } : bot
      ));
      toast.success(currentStatus ? 'Chatbot paused' : 'Chatbot activated');
    }
    setOpenMenu(null);
  };

  const filteredBots = chatbots.filter((bot) => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && bot.is_active) || 
      (filter === 'paused' && !bot.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">My Chatbots</h1>
        <Button onClick={() => navigate('/chatbots/new')}>
          <Plus className="w-4 h-4" />
          Create New Bot
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="all">All Bots</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <div className="flex border border-input rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bots Grid/List */}
      {filteredBots.length > 0 ? (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        )}>
          {filteredBots.map((bot) => (
            <Card
              key={bot.id}
              className="hover:shadow-elevation-2 hover:border-primary/30 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{bot.avatar || '🤖'}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{bot.name}</h3>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                          bot.is_active
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        )}
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          bot.is_active ? 'bg-success' : 'bg-warning'
                        )} />
                        {bot.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === bot.id ? null : bot.id)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {openMenu === bot.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-elevation-3 py-1 z-50">
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => handleDuplicateChatbot(bot)}
                          >
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => handleToggleActive(bot.id, bot.is_active)}
                          >
                            <Archive className="w-4 h-4" /> {bot.is_active ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                            onClick={() => handleDeleteChatbot(bot.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {bot.description || 'No description'}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-semibold text-foreground capitalize">{bot.template_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-semibold text-foreground">
                      {new Date(bot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/chatbots/${bot.id}`)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/chat-preview/${bot.id}`)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/analytics?bot=${bot.id}`)}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bot className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No chatbots yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first chatbot to get started engaging with your customers
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/chatbots/new')}>
              <Plus className="w-4 h-4" />
              Create Your First Bot
            </Button>
            <Button variant="outline" onClick={() => navigate('/templates')}>
              Browse Templates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
