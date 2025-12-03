import React, { createContext, useContext, useState } from 'react';

interface OnboardingData {
  fullName: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'enterprise';
  botName: string;
  industry: string;
  botDescription: string;
}

interface OnboardingContextType {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    password: '',
    plan: 'free',
    botName: '',
    industry: '',
    botDescription: '',
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsOnboardingComplete(true);
  };

  return (
    <OnboardingContext.Provider value={{ step, setStep, data, updateData, isOnboardingComplete, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
