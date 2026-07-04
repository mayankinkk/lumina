"use client";

import { OnboardingFlow } from "@/components/layout/onboarding-flow";

export function ClientProviders({ children }) {
  return (
    <>
      <OnboardingFlow />
      {children}
    </>
  );
}
