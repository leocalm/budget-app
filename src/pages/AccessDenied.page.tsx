import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '@/components/Utils';

/**
 * 403 Access Denied error page.
 * Displayed when the user doesn't have permission to access a resource.
 */
export function AccessDeniedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <ErrorState
      variant="fullPage"
      code={403}
      icon="🔒"
      title={t('states.error.403.title')}
      message={t('states.error.403.message')}
      primaryAction={{
        label: t('states.error.actions.goHome'),
        icon: <span>🏠</span>,
        onClick: () => navigate('/dashboard'),
      }}
      secondaryAction={{
        label: t('states.error.actions.requestAccess'),
        icon: <span>📧</span>,
        onClick: () => {
          // Could open a support form or mailto link
          window.location.href = 'mailto:support@piggypulse.com?subject=Access Request';
        },
      }}
      data-testid="access-denied-page"
    />
  );
}
