import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const industries = [
  'Customer Support',
  'Sales',
  'Education',
  'Healthcare',
  'E-commerce',
  'Real Estate',
  'Finance',
  'HR & Recruitment',
  'IT Support',
  'Other',
];

const avatars = ['🤖', '💬', '🎯', '🚀', '💡', '⭐', '🔥', '💎'];

export function InitialSetupScreen() {
  const { setStep, data, updateBotSetup, completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(data.bot.avatar);
  const [starters, setStarters] = useState(data.bot.starters);
  const [industry, setIndustry] = useState(data.business.industry || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = data.bot.botName && industry;

  const handleComplete = async () => {
    if (!user) {
      toast.error('Please sign in to create your bot');
      return;
    }

    setSaving(true);

    try {
      // Save the bot to the database
      const { data: newBot, error } = await supabase
        .from('chatbots')
        .insert({
          user_id: user.id,
          name: data.bot.botName || 'My First Bot',
          description: data.bot.botDescription || null,
          avatar: selectedAvatar,
          template_type: industry || 'custom',
          settings: { starters: starters.filter(s => s.trim()) },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bot:', error);
        throw new Error(error.message);
      }

      // Update local state
      updateBotSetup({ avatar: selectedAvatar, starters });
      
      // Show success animation
      setSuccess(true);
      toast.success('Your bot has been created!');

      // Complete onboarding and navigate after animation
      setTimeout(() => {
        completeOnboarding();
        navigate(`/chatbots/${newBot.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to create bot:', error);
      toast.error('Failed to create bot. Please try again.');
      setSaving(false);
    }
  };

  // Success animation overlay
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
        <div className="text-center animate-scale-in">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-success/10 border-2 border-success">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Bot Created!</h2>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-muted-foreground">Redirecting to your new bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full animate-fade-in">
        <OnboardingProgress currentStep={6} totalSteps={6} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card rounded-2xl border border-border shadow-elevation-2 p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create Your First Bot</h2>
            <p className="text-muted-foreground mb-6">Set up your AI chatbot in just a few steps</p>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (isValid) handleComplete(); }}>
              <div>
                <Label htmlFor="botName">Bot Name *</Label>
                <Input
                  id="botName"
                  placeholder="e.g., Customer Support Bot"
                  value={data.bot.botName}
                  onChange={(e) => updateBotSetup({ botName: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry/Category *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Bot Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your bot will help with..."
                  value={data.bot.botDescription}
                  onChange={(e) => updateBotSetup({ botDescription: e.target.value })}
                  className="mt-1.5 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {data.bot.botDescription.length}/500
                </p>
              </div>

              <div>
                <Label>Bot Avatar</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                        selectedAvatar === avatar
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Conversation Starters</Label>
                <div className="space-y-2 mt-2">
                  {starters.map((starter, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={starter}
                        onChange={(e) => {
                          const newStarters = [...starters];
                          newStarters[index] = e.target.value;
                          setStarters(newStarters);
                        }}
                        placeholder={`Question ${index + 1}`}
                      />
                      {starters.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setStarters(starters.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  {starters.length < 5 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStarters([...starters, ''])}
                    >
                      + Add Starter
                    </Button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" variant="hero" className="flex-1" disabled={!isValid || saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={handleComplete}
                disabled={saving}
              >
                Skip this step
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-card rounded-2xl border border-border shadow-elevation-2 p-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
            
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              {/* Chat Header */}
              <div className="bg-primary p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xl">
                  {selectedAvatar}
                </div>
                <div>
                  <p className="font-medium text-primary-foreground">
                    {data.bot.botName || 'Your Bot Name'}
                  </p>
                  <p className="text-xs text-primary-foreground/70">Online</p>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 h-[300px] overflow-y-auto">
                <div className="flex gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {selectedAvatar}
                  </div>
                  <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Hi! I'm {data.bot.botName || 'your assistant'}. How can I help you today?
                    </p>
                  </div>
                </div>

                {/* Conversation Starters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {starters.filter(s => s).slice(0, 3).map((starter, index) => (
                    <button
                      key={index}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled
                  />
                  <Button size="icon" disabled>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>This is how your bot will appear to visitors</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setStep(5)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
