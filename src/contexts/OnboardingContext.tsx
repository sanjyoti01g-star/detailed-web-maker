import React, { createContext, useContext, useState } from 'react';

interface PersonalInfo {
  fullName: string;
  address: string;
  age: string;
  profession: string;
  email: string;
  password: string;
  phone: string;
  language: string;
  timezone: string;
  marketingOptIn: boolean;
  oauthProvider: string | null;
}

interface BusinessDocument {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface BusinessInfo {
  purpose: string;
  businessName: string;
  website: string;
  industry: string;
  companySize: string;
  region: string;
  documents: BusinessDocument[];
}

interface BotSetup {
  botName: string;
  botDescription: string;
  avatar: string;
  starters: string[];
}

interface OnboardingData {
  personal: PersonalInfo;
  business: BusinessInfo;
  bot: BotSetup;
  plan: 'free' | 'pro' | 'enterprise';
}

interface OnboardingContextType {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateBusinessInfo: (data: Partial<BusinessInfo>) => void;
  updateBotSetup: (data: Partial<BotSetup>) => void;
  updatePlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const defaultPersonalInfo: PersonalInfo = {
  fullName: '',
  address: '',
  age: '',
  profession: '',
  email: '',
  password: '',
  phone: '',
  language: 'English (US)',
  timezone: 'GMT-5 (Eastern Time)',
  marketingOptIn: false,
  oauthProvider: null,
};

const defaultBusinessInfo: BusinessInfo = {
  purpose: '',
  businessName: '',
  website: '',
  industry: '',
  companySize: '',
  region: '',
  documents: [],
};

const defaultBotSetup: BotSetup = {
  botName: '',
  botDescription: '',
  avatar: '🤖',
  starters: ['What services do you offer?', 'How can I contact support?', 'What are your business hours?'],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });

  const [data, setData] = useState<OnboardingData>(() => {
    const saved = localStorage.getItem('onboardingData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      personal: defaultPersonalInfo,
      business: defaultBusinessInfo,
      bot: defaultBotSetup,
      plan: 'free',
    };
  });

  const saveToLocalStorage = (newData: OnboardingData) => {
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  const updatePersonalInfo = (newData: Partial<PersonalInfo>) => {
    setData(prev => {
      const updated = { ...prev, personal: { ...prev.personal, ...newData } };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const updateBusinessInfo = (newData: Partial<BusinessInfo>) => {
    setData(prev => {
      const updated = { ...prev, business: { ...prev.business, ...newData } };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const updateBotSetup = (newData: Partial<BotSetup>) => {
    setData(prev => {
      const updated = { ...prev, bot: { ...prev.bot, ...newData } };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const updatePlan = (plan: 'free' | 'pro' | 'enterprise') => {
    setData(prev => {
      const updated = { ...prev, plan };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsOnboardingComplete(true);
  };

  return (
    <OnboardingContext.Provider value={{
      step,
      setStep,
      data,
      updatePersonalInfo,
      updateBusinessInfo,
      updateBotSetup,
      updatePlan,
      isOnboardingComplete,
      completeOnboarding
    }}>
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
