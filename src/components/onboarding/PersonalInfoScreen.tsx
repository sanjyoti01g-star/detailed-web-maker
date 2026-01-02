import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const professions = ['Designer', 'Engineer', 'Manager', 'Owner', 'Student', 'Developer', 'Marketer', 'Consultant', 'Other'];

const languages = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
];

const timezones = [
  'GMT-12 (Baker Island)', 'GMT-11 (American Samoa)', 'GMT-10 (Hawaii)', 'GMT-9 (Alaska)',
  'GMT-8 (Pacific Time)', 'GMT-7 (Mountain Time)', 'GMT-6 (Central Time)', 'GMT-5 (Eastern Time)',
  'GMT-4 (Atlantic Time)', 'GMT-3 (Buenos Aires)', 'GMT-2 (Mid-Atlantic)', 'GMT-1 (Azores)',
  'GMT+0 (London)', 'GMT+1 (Paris)', 'GMT+2 (Cairo)', 'GMT+3 (Moscow)',
  'GMT+4 (Dubai)', 'GMT+5 (Karachi)', 'GMT+5:30 (Mumbai)', 'GMT+6 (Dhaka)',
  'GMT+7 (Bangkok)', 'GMT+8 (Singapore)', 'GMT+9 (Tokyo)', 'GMT+10 (Sydney)',
  'GMT+11 (Vladivostok)', 'GMT+12 (Auckland)'
];

export function PersonalInfoScreen() {
  const { setStep, data, updatePersonalInfo } = useOnboarding();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const ageValid = data.personal.age ? parseInt(data.personal.age) > 13 : false;
  
  const isValid = data.personal.fullName && data.personal.email && data.personal.password.length >= 8 && passwordsMatch;

  const handleGoogleAuth = () => {
    // Placeholder for Google OAuth
    toast.info('Google OAuth integration coming soon!');
    updatePersonalInfo({ oauthProvider: 'google' });
  };

  const handleContinue = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    const { error } = await signUp(
      data.personal.email,
      data.personal.password,
      data.personal.fullName
    );
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      setIsSubmitting(false);
      return;
    }
    
    toast.success('Account created successfully!');
    setStep(3); // Move to Business Info
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-fade-in">
        <OnboardingProgress currentStep={2} totalSteps={6} />
        
        <div className="mt-6 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Section 1 of 2
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-elevation-2 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Personal Info</h2>
          <p className="text-muted-foreground mb-6">Tell us about yourself</p>

          {/* Google Auth Button */}
          <Button 
            variant="outline" 
            className="w-full mb-6 gap-2"
            onClick={handleGoogleAuth}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={data.personal.fullName}
                onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Street, City, State, ZIP"
                value={data.personal.address}
                onChange={(e) => updatePersonalInfo({ address: e.target.value })}
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min="14"
                  max="120"
                  value={data.personal.age}
                  onChange={(e) => updatePersonalInfo({ age: e.target.value })}
                  className="mt-1.5"
                />
                {data.personal.age && !ageValid && (
                  <p className="text-xs text-destructive mt-1">Must be at least 14 years old</p>
                )}
              </div>

              <div>
                <Label htmlFor="profession">Profession *</Label>
                <Select value={data.personal.profession} onValueChange={(value) => updatePersonalInfo({ profession: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((prof) => (
                      <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
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
              <Label htmlFor="password">Password *</Label>
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
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
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

            <div className="pt-4 border-t border-border space-y-4">
              <p className="text-sm font-medium text-foreground">Additional Information (Optional)</p>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={data.personal.language} onValueChange={(value) => updatePersonalInfo({ language: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={data.personal.timezone} onValueChange={(value) => updatePersonalInfo({ timezone: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="marketing"
                  checked={data.personal.marketingOptIn}
                  onCheckedChange={(checked) => updatePersonalInfo({ marketingOptIn: checked === true })}
                />
                <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I'd like to receive product updates, tips, and special offers via email
                </Label>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
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
