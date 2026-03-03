import { Navigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/Onboarding/OnboardingWizard';
import { useAuth } from '@/context/AuthContext';

export function OnboardingPage() {
  const { user } = useAuth();

  if (user?.onboardingStatus === 'completed') {
    return <Navigate to="/dashboard" replace />;
  }

  return <OnboardingWizard />;
}
