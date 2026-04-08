import { useEffect, useState } from 'react';
import { IconShieldOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { useEmergencyDisableConfirm, useEmergencyDisableRequest } from '@/hooks/v2/useTwoFactor';
import classes from './Auth.module.css';

export function V2Emergency2FADisablePage() {
  const { t } = useTranslation('v2');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const requestMutation = useEmergencyDisableRequest();
  const confirmMutation = useEmergencyDisableConfirm();

  // Remove token from URL for security
  useEffect(() => {
    if (token) {
      window.history.replaceState({}, '', '/auth/emergency-2fa-disable');
    }
  }, [token]);

  const handleRequest = async () => {
    try {
      await requestMutation.mutateAsync({ email });
    } catch {
      // Always show sent state to prevent email enumeration
    }
    setRequestSent(true);
  };

  const handleConfirm = async () => {
    if (!token) {
      return;
    }
    setConfirmError(null);
    try {
      await confirmMutation.mutateAsync({ token });
      setConfirmSuccess(true);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : t('auth.emergency2fa.confirmError'));
    }
  };

  // Confirm success
  if (confirmSuccess) {
    return (
      <div className={classes.successContent}>
        <Text fz={32}>🔓</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.emergency2fa.disabledTitle')}
        </Text>
        <Text fz="sm" c="dimmed" ta="center">
          {t('auth.emergency2fa.disabledMessage')}
        </Text>
        <Button component={Link} to="/auth/login" size="md" mt="md">
          {t('auth.emergency2fa.goToSignIn')}
        </Button>
      </div>
    );
  }

  // Request sent
  if (requestSent) {
    return (
      <Stack gap="md" ta="center">
        <Text fz={32}>📧</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.emergency2fa.sentTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.emergency2fa.sentMessage')}
        </Text>
        <Anchor component={Link} to="/auth/login" fz="sm" c="var(--v2-primary)" mt="md">
          {t('auth.emergency2fa.backToSignIn')}
        </Anchor>
      </Stack>
    );
  }

  // Confirm flow (token present in URL)
  if (token) {
    return (
      <Stack gap="md">
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.emergency2fa.confirmTitle')}
        </Text>

        {confirmError && (
          <Alert color="red" variant="light">
            {confirmError}
          </Alert>
        )}

        <Alert color="yellow" variant="light">
          {t('auth.emergency2fa.confirmWarning')}
        </Alert>

        <Text fz="sm" c="dimmed">
          {t('auth.emergency2fa.confirmDescription')}
        </Text>

        <Button
          fullWidth
          color="red"
          leftSection={<IconShieldOff size={16} />}
          onClick={handleConfirm}
          loading={confirmMutation.isPending}
          size="md"
        >
          {t('auth.emergency2fa.confirmButton')}
        </Button>

        <Anchor component={Link} to="/auth/login" fz="sm" c="var(--v2-primary)" ta="center" mt="xs">
          {t('auth.emergency2fa.backToSignIn')}
        </Anchor>
      </Stack>
    );
  }

  // Request flow (no token)
  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.emergency2fa.title')}
      </Text>

      <Alert color="blue" variant="light">
        {t('auth.emergency2fa.infoMessage')}
      </Alert>

      <Text fz="sm" c="dimmed">
        {t('auth.emergency2fa.subtitle')}
      </Text>

      <TextInput
        label={t('auth.emergency2fa.emailLabel')}
        placeholder={t('auth.emergency2fa.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && email) {
            void handleRequest();
          }
        }}
      />

      <Button
        onClick={handleRequest}
        loading={requestMutation.isPending}
        fullWidth
        size="md"
        disabled={!email}
      >
        {t('auth.emergency2fa.submitButton')}
      </Button>

      <Text fz="sm" c="dimmed" ta="center" mt="md">
        {t('auth.emergency2fa.rememberPassword')}{' '}
        <Anchor component={Link} to="/auth/login" c="var(--v2-primary)" fw={600}>
          {t('auth.emergency2fa.signIn')}
        </Anchor>
      </Text>
    </Stack>
  );
}
