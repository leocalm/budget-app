import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Loader, Text } from '@mantine/core';
import { apiClient } from '@/api/v2client';
import classes from './Auth.module.css';

type Status = 'loading' | 'success' | 'error';

export function V2UnlockAccountPage() {
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
    window.history.replaceState({}, '', '/v2/auth/unlock');

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
          Unlocking your account...
        </Text>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={classes.successContent}>
        <Text fz={32}>🔓</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          Account unlocked
        </Text>
        <Text fz="sm" c="dimmed">
          Your account has been unlocked. You can now sign in.
        </Text>
        <Button component={Link} to="/v2/auth/login" size="md" mt="md">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.successContent}>
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        Invalid unlock link
      </Text>
      <Text fz="sm" c="dimmed">
        This link has expired or is invalid.
      </Text>
      <Button component={Link} to="/v2/auth/login" size="md" mt="md">
        Go to Sign In
      </Button>
    </div>
  );
}
