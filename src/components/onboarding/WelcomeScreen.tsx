import { Bot, Brain, BarChart3, Plug, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

const features = [
  { icon: Bot, title: 'Easy to Build', description: 'Create chatbots in minutes with our intuitive builder' },
  { icon: Brain, title: 'AI-Powered', description: 'Leverage advanced AI for natural conversations' },
  { icon: Plug, title: 'Integrates Anywhere', description: 'Deploy on any website or platform' },
  { icon: BarChart3, title: 'Powerful Analytics', description: 'Track performance with detailed insights' },
];

export function WelcomeScreen() {
  const { setStep, completeOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center animate-fade-in">
        {/* Logo & Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Build AI Chatbots in Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create intelligent, customizable chatbots that engage your customers 24/7. No coding required.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl bg-card border border-border shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="xl"
            onClick={() => setStep(2)}
            className="group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            onClick={() => setStep(7)}
          >
            Sign In
          </Button>
        </div>

        {/* Trust indicators */}
        <p className="mt-8 text-sm text-muted-foreground">
          Trusted by 10,000+ businesses worldwide
        </p>
      </div>
    </div>
  );
}
