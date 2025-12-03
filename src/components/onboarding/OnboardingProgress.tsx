import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            index + 1 === currentStep
              ? 'w-8 bg-primary'
              : index + 1 < currentStep
              ? 'w-2 bg-primary'
              : 'w-2 bg-muted'
          )}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}
