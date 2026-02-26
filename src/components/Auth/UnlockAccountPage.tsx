import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Stack, Text, Title } from '@mantine/core';
import { unlockAccount } from '@/api/auth';
import { AuthCard, AuthMessage } from './AuthCard';

export function UnlockAccountPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token'));
  const [userId] = useState(() => searchParams.get('user'));

  const [unlocking, setUnlocking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove sensitive token and user from the URL to reduce leak risk via history/referrer logs.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.has('token')) {
      url.searchParams.delete('token');
      changed = true;
    }
    if (url.searchParams.has('user')) {
      url.searchParams.delete('user');
      changed = true;
    }
    if (changed) {
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  // Attempt unlock on mount
  useEffect(() => {
    const tryUnlock = async () => {
      if (!token || !userId) {
        setError(
          t(
            'auth.unlockAccount.errors.missingParams',
            'Invalid unlock link. Please request a new one by trying to log in.'
          )
        );
        setUnlocking(false);
        return;
      }

      try {
        await unlockAccount(token, userId);
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('auth.unlockAccount.errors.generic', 'Failed to unlock account.')
        );
      } finally {
        setUnlocking(false);
      }
    };

    void tryUnlock();
  }, [token, userId, t]);

  if (unlocking) {
    return (
      <AuthCard>
        <Text c="dimmed" ta="center" size="sm">
          {t('auth.unlockAccount.unlocking', 'Unlocking your account\u2026')}
        </Text>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard>
        <Title order={2} ta="center">
          {t('auth.unlockAccount.successTitle', 'Account unlocked')}
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          {t(
            'auth.unlockAccount.successMessage',
            'Your account has been unlocked. You can now log in.'
          )}
        </Text>
        <Button component={Link} to="/auth/login" fullWidth>
          {t('auth.unlockAccount.goToLogin', 'Go to login')}
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Title order={2} ta="center">
        {t('auth.unlockAccount.errorTitle', 'Unlock failed')}
      </Title>
      <AuthMessage message={error} />
      <Stack gap="xs">
        <Button component={Link} to="/auth/login" fullWidth>
          {t('auth.unlockAccount.tryLogin', 'Back to login')}
        </Button>
      </Stack>
    </AuthCard>
  );
}
