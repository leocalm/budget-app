import { useEffect, useState } from 'react';
import { IconAlertCircle, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { apiPost } from '@/api/client';
import { ApiError } from '@/api/errors';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.login.validation.invalidEmail')),
      password: (val) => (val.length < 6 ? t('auth.login.validation.passwordMinLength') : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      await apiPost<void, { email: string; password: string; twoFactorCode?: string }>(
        '/api/users/login',
        {
          email: values.email,
          password: values.password,
          twoFactorCode: requires2FA && twoFactorCode ? twoFactorCode : undefined,
        }
      );

      // Login successful - hydrate user from cookie-backed endpoint
      const refreshed = await refreshUser(values.rememberMe, false);
      if (!refreshed) {
        throw new Error(t('auth.login.errors.generic'));
      }

      // Navigate to the page user was trying to access, or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 428) {
        const data = err.data as { twoFactorRequired?: boolean } | undefined;
        if (data?.twoFactorRequired) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }
      }

      setError(err instanceof Error ? err.message : t('auth.login.errors.generic'));
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setUseBackupCode(false);
    setError(null);
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {requires2FA ? (
          <>
            <IconShieldCheck size={32} style={{ marginBottom: 8 }} />
            <br />
            Two-Factor Authentication
          </>
        ) : (
          t('auth.login.welcomeBack')
        )}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('auth.login.errors.title')}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          {!requires2FA ? (
            <>
              <TextInput
                label={t('auth.login.emailLabel')}
                placeholder={t('auth.login.emailPlaceholder')}
                required
                disabled={loading}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label={t('auth.login.passwordLabel')}
                placeholder={t('auth.login.passwordPlaceholder')}
                required
                disabled={loading}
                {...form.getInputProps('password')}
              />

              <Group justify="space-between">
                <Checkbox
                  label={t('auth.login.rememberMe')}
                  disabled={loading}
                  {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                />
                <Anchor component={Link} to="/auth/forgot-password" size="sm">
                  {t('auth.login.forgotPassword')}
                </Anchor>
              </Group>

              <Button fullWidth type="submit" loading={loading}>
                {t('auth.login.signIn')}
              </Button>
            </>
          ) : (
            <>
              <Text size="sm" ta="center">
                {useBackupCode
                  ? 'Enter one of your backup codes'
                  : 'Enter the 6-digit code from your authenticator app'}
              </Text>

              {useBackupCode ? (
                <TextInput
                  placeholder="Enter backup code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.currentTarget.value)}
                  disabled={loading}
                  autoFocus
                />
              ) : (
                <Group justify="center">
                  <PinInput
                    length={6}
                    value={twoFactorCode}
                    onChange={setTwoFactorCode}
                    placeholder=""
                    type="number"
                    size="lg"
                    disabled={loading}
                    autoFocus
                  />
                </Group>
              )}

              <Anchor
                size="sm"
                ta="center"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode('');
                }}
                style={{ cursor: 'pointer' }}
              >
                {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
              </Anchor>

              <Anchor
                component={Link}
                to="/auth/emergency-2fa-disable"
                size="sm"
                ta="center"
                c="red"
              >
                Lost access to your authenticator?
              </Anchor>

              <Group justify="space-between" mt="md">
                <Button variant="default" onClick={handleBack} disabled={loading}>
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={useBackupCode ? !twoFactorCode : twoFactorCode.length !== 6}
                >
                  Verify
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </form>

      {!requires2FA && (
        <Text c="dimmed" size="sm" ta="center" mt={20}>
          {t('auth.login.noAccountYet')}{' '}
          <Anchor component={Link} to="/auth/register" size="sm">
            {t('auth.login.createAccount')}
          </Anchor>
        </Text>
      )}
    </Paper>
  );
}
