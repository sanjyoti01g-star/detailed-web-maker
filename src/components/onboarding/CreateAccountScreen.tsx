import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';

export function CreateAccountScreen() {
  const { setStep, data, updatePersonalInfo } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = () => {
    const password = data.personal.password;
    if (password.length < 6) return { level: 0, text: 'Too short', color: 'text-destructive' };
    if (password.length < 8) return { level: 1, text: 'Weak', color: 'text-warning' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: 'Strong', color: 'text-success' };
    }
    return { level: 2, text: 'Medium', color: 'text-warning' };
  };

  const strength = passwordStrength();
  const passwordsMatch = data.personal.password === confirmPassword && confirmPassword.length > 0;
  const isValid = data.personal.fullName && data.personal.email && data.personal.password.length >= 8 && passwordsMatch && agreed;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <OnboardingProgress currentStep={1} totalSteps={6} />
        
        <div className="mt-8 bg-card rounded-2xl border border-border shadow-elevation-2 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
          <p className="text-muted-foreground mb-6">Join thousands of businesses using AI chatbots</p>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (isValid) setStep(2); }}>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={data.personal.fullName}
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={data.personal.email}
                onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={data.personal.password}
                  onChange={(e) => updatePersonalInfo({ password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {data.personal.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        strength.level === 0 ? 'w-1/4 bg-destructive' :
                        strength.level === 1 ? 'w-1/2 bg-warning' :
                        strength.level === 2 ? 'w-3/4 bg-warning' : 'w-full bg-success'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strength.color}`}>{strength.text}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                {confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={!isValid}>
              Continue to Personal Info
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button 
              className="text-primary font-medium hover:underline"
              onClick={() => setStep(6)}
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
