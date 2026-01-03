import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Onboarding
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { CreateAccountScreen } from "@/components/onboarding/CreateAccountScreen";
import { PersonalInfoScreen } from "@/components/onboarding/PersonalInfoScreen";
import { BusinessInfoScreen } from "@/components/onboarding/BusinessInfoScreen";
import { ChoosePlanScreen } from "@/components/onboarding/ChoosePlanScreen";
// EmailVerificationScreen removed - auto-confirm is enabled
import { InitialSetupScreen } from "@/components/onboarding/InitialSetupScreen";
import { SignInScreen } from "@/components/onboarding/SignInScreen";

// Main App
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import MyChatbots from "@/pages/MyChatbots";
import BotBuilder from "@/pages/BotBuilder";
import Documents from "@/pages/Documents";
import ChatPreview from "@/pages/ChatPreview";
import Analytics from "@/pages/Analytics";
import Templates from "@/pages/Templates";
import Integrations from "@/pages/Integrations";
import Team from "@/pages/Team";
import ApiKeys from "@/pages/ApiKeys";
import Settings from "@/pages/Settings";
import Billing from "@/pages/Billing";
import Support from "@/pages/Support";
import NotFound from "@/pages/NotFound";
import CreateBotManual from "@/pages/CreateBotManual";
import DemoEmbed from "@/pages/DemoEmbed";

const queryClient = new QueryClient();

function OnboardingFlow() {
  const { step } = useOnboarding();

  switch (step) {
    case 1:
      return <WelcomeScreen />;
    case 2:
      return <PersonalInfoScreen />;
    case 3:
      return <BusinessInfoScreen />;
    case 4:
      return <ChoosePlanScreen />;
    case 5:
      return <InitialSetupScreen />;
    case 6:
      return <SignInScreen />;
    default:
      return <WelcomeScreen />;
  }
}

function AppRoutes() {
  const { isOnboardingComplete } = useOnboarding();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isOnboardingComplete || !user) {
    return <OnboardingFlow />;
  }

  return (
    <Routes>
      <Route path="/demo-embed" element={<DemoEmbed />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/create-bot-manual" element={<CreateBotManual />} />
        <Route path="/chatbots" element={<MyChatbots />} />
        <Route path="/chatbots/new" element={<BotBuilder />} />
        <Route path="/chatbots/:botId" element={<BotBuilder />} />
        <Route path="/chat-preview/:botId" element={<ChatPreview />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/team" element={<Team />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/support" element={<Support />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
