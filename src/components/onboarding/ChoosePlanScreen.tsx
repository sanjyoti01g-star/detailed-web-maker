import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    features: ['1 Chatbot', '100 conversations/month', 'Basic analytics', 'Community support'],
    cta: 'Select Free',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 29,
    yearlyPrice: 290,
    recommended: true,
    features: ['10 Chatbots', '10,000 conversations/month', 'Advanced analytics', 'Priority support', 'Custom branding', 'API access', 'Integrations'],
    cta: 'Select Pro',
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 99,
    yearlyPrice: 990,
    features: ['Unlimited chatbots', 'Unlimited conversations', 'Advanced analytics + exports', 'Dedicated support', 'Custom branding', 'Full API access', 'All integrations', 'Custom models', 'SLA guarantee'],
    cta: 'Contact Sales',
  },
];

export function ChoosePlanScreen() {
  const { setStep, data, updatePlan } = useOnboarding();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full animate-fade-in">
        <OnboardingProgress currentStep={3} totalSteps={5} />
        
        <div className="mt-8 text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Start free, upgrade when you need more</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={cn('text-sm font-medium', !isYearly ? 'text-foreground' : 'text-muted-foreground')}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              'relative w-14 h-7 rounded-full transition-colors',
              isYearly ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-5 h-5 rounded-full bg-card shadow-elevation-1 transition-transform',
                isYearly ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('text-sm font-medium', isYearly ? 'text-foreground' : 'text-muted-foreground')}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-2 py-0.5 text-xs font-medium bg-success/10 text-success rounded-full">
              Save 20%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl border p-6 transition-all cursor-pointer',
                plan.recommended
                  ? 'border-primary bg-primary/5 shadow-elevation-2 scale-105'
                  : 'border-border bg-card hover:border-primary/50',
                data.plan === plan.id && 'ring-2 ring-primary'
              )}
              onClick={() => updatePlan(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-foreground">
                  ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.price}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
                {isYearly && plan.price > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${plan.yearlyPrice}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={data.plan === plan.id ? 'default' : 'outline'}
                className="w-full"
              >
                {data.plan === plan.id ? 'Selected' : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" onClick={() => setStep(5)}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setStep(3)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
