import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Loader, Text } from '@mantine/core';
import { apiClient } from '@/api/v2client';
import classes from './Auth.module.css';

type Status = 'loading' | 'success' | 'error';

export function V2UnlockAccountPage() {
  const { t } = useTranslation('v2');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('user');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token || !userId) {
      setStatus('error');
      return;
    }

    // Remove params from URL for security
    window.history.replaceState({}, '', '/auth/unlock');

    apiClient
      .GET('/unlock', { params: { query: { token, user: userId } } })
      .then(({ error }) => {
        setStatus(error ? 'error' : 'success');
      })
      .catch(() => setStatus('error'));
  }, [token, userId]);

  if (status === 'loading') {
    return (
      <div className={classes.successContent}>
        <Loader size="md" />
        <Text fz="sm" c="dimmed">
          {t('auth.unlock.loading')}
        </Text>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={classes.successContent}>
        <Text fz={32}>🔓</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.unlock.successTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.unlock.successMessage')}
        </Text>
        <Button component={Link} to="/auth/login" size="md" mt="md">
          {t('auth.unlock.goToSignIn')}
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.successContent}>
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.unlock.errorTitle')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.unlock.errorMessage')}
      </Text>
      <Button component={Link} to="/auth/login" size="md" mt="md">
        {t('auth.unlock.goToSignIn')}
      </Button>
    </div>
  );
}
