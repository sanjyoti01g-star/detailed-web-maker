import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';

export function EmailVerificationScreen() {
  const { setStep, data } = useOnboarding();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <OnboardingProgress currentStep={2} totalSteps={5} />
        
        <div className="mt-8 bg-card rounded-2xl border border-border shadow-elevation-2 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Email</h2>
          <p className="text-muted-foreground mb-8">
            We sent a 6-digit code to<br />
            <span className="font-medium text-foreground">{data.email || 'your@email.com'}</span>
          </p>

          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            ))}
          </div>

          <Button
            variant="hero"
            className="w-full mb-4"
            disabled={!isComplete}
            onClick={() => setStep(4)}
          >
            Verify
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-sm text-muted-foreground">
            {resendTimer > 0 ? (
              <p>Resend code in {resendTimer}s</p>
            ) : (
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setResendTimer(60)}
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setStep(2)}
          >
            Change Email
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setStep(2)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
