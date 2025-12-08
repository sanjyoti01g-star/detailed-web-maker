import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, FileText, Sparkles, Palette, Check, Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockTemplates } from '@/data/mockData';

const steps = [
  { id: 1, title: 'Basic Info', icon: Bot },
  { id: 2, title: 'Upload Documents', icon: FileText },
  { id: 3, title: 'Personality', icon: Sparkles },
  { id: 4, title: 'Appearance', icon: Palette },
  { id: 5, title: 'Review & Create', icon: Check },
];

const industries = [
  'Customer Support', 'Sales', 'Education', 'Healthcare', 'E-commerce',
  'Real Estate', 'Finance', 'HR & Recruitment', 'IT Support', 'Other',
];

const tones = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
  { value: 'technical', label: 'Technical', description: 'Detailed and precise' },
];

const avatars = ['🤖', '💬', '🎯', '🚀', '💡', '⭐', '🔥', '💎', '🦊', '🐼', '🌟', '💼'];

const primaryColors = [
  { value: 'blue', class: 'bg-blue-500' },
  { value: 'purple', class: 'bg-purple-500' },
  { value: 'green', class: 'bg-green-500' },
  { value: 'orange', class: 'bg-orange-500' },
  { value: 'pink', class: 'bg-pink-500' },
  { value: 'teal', class: 'bg-teal-500' },
];

interface UploadedDoc {
  name: string;
  size: number;
}

export default function CreateBotManual() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Form state
  const [botName, setBotName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [tone, setTone] = useState('friendly');
  const [creativity, setCreativity] = useState([50]);
  const [responseLength, setResponseLength] = useState('medium');
  const [avatar, setAvatar] = useState('🤖');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?');
  const [starters, setStarters] = useState(['What services do you offer?', 'How can I contact support?', '']);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      setDocuments([...documents, ...newDocs]);
      toast.success(`${newDocs.length} file(s) uploaded`);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setBotName(template.name);
      setIndustry(template.category);
      setDescription(template.description);
      toast.success(`Template "${template.name}" applied!`);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return botName && industry;
      case 2: return true; // Documents are optional
      case 3: return tone;
      case 4: return avatar && primaryColor;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create bot
      toast.success('Bot created successfully!');
      navigate('/chatbots');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="pb-16 lg:pb-0 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Bot Manually</h1>
          <p className="text-muted-foreground">Build your chatbot step-by-step</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    currentStep > step.id
                      ? 'bg-success text-success-foreground'
                      : currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-2 hidden sm:block',
                  currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-12 sm:w-20 mx-2',
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Panel (Left) */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a template to auto-fill fields, or build from scratch
              </p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {mockTemplates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form (Right) */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="botName">Bot Name *</Label>
                        <Input
                          id="botName"
                          placeholder="e.g., Customer Support Bot"
                          value={botName}
                          onChange={(e) => setBotName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry / Category *</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="description">Bot Description (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what your bot will help with..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1.5 min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {description.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Upload Documents */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload documents to train your chatbot with accurate information
                    </p>

                    <div
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => document.getElementById('docInput')?.click()}
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-foreground font-medium">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports PDF, DOCX, CSV, TXT (Max 10MB per file)
                      </p>
                      <input
                        id="docInput"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <File className="w-4 h-4 text-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                            </div>
                            <button onClick={() => removeDocument(index)} className="p-1 hover:bg-background rounded">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Personality */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Bot Personality</h3>

                    <div className="space-y-6">
                      <div>
                        <Label className="mb-3 block">Tone of Voice</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {tones.map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setTone(t.value)}
                              className={cn(
                                'p-4 rounded-lg border text-left transition-all',
                                tone === t.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <p className="font-medium text-foreground">{t.label}</p>
                              <p className="text-xs text-muted-foreground">{t.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Creativity Level: {creativity[0]}%</Label>
                        <Slider
                          value={creativity}
                          onValueChange={setCreativity}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Focused</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      <div>
                        <Label>Response Length</Label>
                        <Select value={responseLength} onValueChange={setResponseLength}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short & Concise</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Appearance */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>

                    <div className="space-y-6">
                      <div>
                        <Label className="mb-3 block">Bot Avatar</Label>
                        <div className="flex flex-wrap gap-2">
                          {avatars.map((a) => (
                            <button
                              key={a}
                              onClick={() => setAvatar(a)}
                              className={cn(
                                'w-12 h-12 text-2xl rounded-lg border-2 transition-all',
                                avatar === a
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Primary Color</Label>
                        <div className="flex gap-2">
                          {primaryColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setPrimaryColor(color.value)}
                              className={cn(
                                'w-10 h-10 rounded-full transition-all',
                                color.class,
                                primaryColor === color.value
                                  ? 'ring-2 ring-offset-2 ring-foreground'
                                  : 'hover:scale-110'
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="welcome">Welcome Message</Label>
                        <Input
                          id="welcome"
                          value={welcomeMessage}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Conversation Starters</Label>
                        <div className="space-y-2">
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
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setStarters(starters.filter((_, i) => i !== index))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {starters.length < 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setStarters([...starters, ''])}
                            >
                              + Add Starter
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Review & Create</h3>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Basic Info</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">Name:</p>
                        <p className="text-foreground">{botName}</p>
                        <p className="text-muted-foreground">Industry:</p>
                        <p className="text-foreground">{industry}</p>
                        <p className="text-muted-foreground">Description:</p>
                        <p className="text-foreground">{description || '-'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Documents</h4>
                      <p className="text-sm text-foreground">
                        {documents.length > 0 ? `${documents.length} document(s) uploaded` : 'No documents uploaded'}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Personality</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">Tone:</p>
                        <p className="text-foreground capitalize">{tone}</p>
                        <p className="text-muted-foreground">Creativity:</p>
                        <p className="text-foreground">{creativity[0]}%</p>
                        <p className="text-muted-foreground">Response Length:</p>
                        <p className="text-foreground capitalize">{responseLength}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-foreground mb-2">Appearance</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{avatar}</span>
                        <div className={cn('w-8 h-8 rounded-full', primaryColors.find(c => c.value === primaryColor)?.class)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  {currentStep === 5 ? 'Create Bot' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
