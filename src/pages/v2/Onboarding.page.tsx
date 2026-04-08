import { Navigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/v2/Onboarding';
import { useAuth } from '@/context/AuthContext';
import { V2ThemeProvider } from '@/theme/v2';

export function OnboardingV2Page() {
  const { user } = useAuth();

  if (user?.onboardingStatus === 'completed') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <V2ThemeProvider>
      <OnboardingWizard />
    </V2ThemeProvider>
  );
}
