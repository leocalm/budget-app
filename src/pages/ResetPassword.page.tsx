import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck, IconKey, IconLoader, IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Progress,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { confirmPasswordReset, validatePasswordResetToken } from '@/api/passwordReset';

// Password strength indicator
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (password.length === 0) {
    return { score: 0, label: '', color: 'gray' };
  }

  let score = 0;

  // Length
  if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }

  // Character types
  if (/[a-z]/.test(password)) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  // Normalize to 0-100
  const percentage = (score / 6) * 100;

  const { label, color } =
    percentage < 30
      ? { label: 'Weak', color: 'red' }
      : percentage < 50
        ? { label: 'Fair', color: 'orange' }
        : percentage < 80
          ? { label: 'Good', color: 'yellow' }
          : { label: 'Strong', color: 'green' };

  return { score: percentage, label, color };
}

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token'));

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (val) => {
        if (val.length < 8) {
          return t(
            'auth.resetPassword.validation.passwordMinLength',
            'Password must be at least 8 characters'
          );
        }
        const strength = getPasswordStrength(val);
        if (strength.score < 30) {
          return t(
            'auth.resetPassword.validation.passwordWeak',
            'Password is too weak. Please use a stronger password.'
          );
        }
        return null;
      },
      confirmPassword: (val, values) =>
        val !== values.password
          ? t('auth.resetPassword.validation.passwordsDoNotMatch', 'Passwords do not match')
          : null,
    },
  });

  const passwordStrength = getPasswordStrength(form.values.password);

  // Remove sensitive token from the URL to reduce leak risk via history/referrer logs.
  useEffect(() => {
    if (!token || typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has('token')) {
      return;
    }

    url.searchParams.delete('token');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [token]);

  // Validate token on mount
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError(
          t(
            'auth.resetPassword.errors.noToken',
            'No reset token found. Please request a new password reset.'
          )
        );
        setValidating(false);
        return;
      }

      try {
        const response = await validatePasswordResetToken(token);
        if (response.valid) {
          setTokenValid(true);
          setUserEmail(response.email || null);
        } else {
          setError(
            t(
              'auth.resetPassword.errors.invalidToken',
              'This password reset link is invalid or has expired. Please request a new one.'
            )
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('auth.resetPassword.errors.validationFailed', 'Failed to validate reset token')
        );
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [token, t]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      setError(t('auth.resetPassword.errors.noToken', 'No reset token found'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(token, values.password);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('auth.resetPassword.errors.generic', 'Failed to reset password')
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md" align="center">
            <IconLoader size={48} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Title order={2}>
              {t('auth.resetPassword.validating', 'Validating reset link...')}
            </Title>
            <Text c="dimmed" size="sm">
              {t('auth.resetPassword.pleaseWait', 'Please wait while we verify your reset link.')}
            </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md">
            <IconCheck
              size={48}
              style={{ margin: '0 auto', color: 'var(--mantine-color-green-6)' }}
            />
            <Title order={2} ta="center">
              {t('auth.resetPassword.success.title', 'Password reset successful!')}
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              {t(
                'auth.resetPassword.success.message',
                'Your password has been reset successfully. Redirecting to login...'
              )}
            </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md">
            <IconAlertCircle
              size={48}
              style={{ margin: '0 auto', color: 'var(--mantine-color-red-6)' }}
            />
            <Title order={2} ta="center">
              {t('auth.resetPassword.invalid.title', 'Invalid reset link')}
            </Title>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('auth.resetPassword.errors.title', 'Error')}
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <Stack gap="xs">
              <Button
                component={Link}
                to="/auth/forgot-password"
                fullWidth
                leftSection={<IconKey size={16} />}
              >
                {t('auth.resetPassword.requestNew', 'Request new reset link')}
              </Button>

              <Button component={Link} to="/auth/login" variant="subtle" fullWidth>
                {t('auth.resetPassword.backToLogin', 'Back to login')}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Reset password form
  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <IconLock size={48} style={{ margin: '0 auto', color: 'var(--mantine-color-blue-6)' }} />

          <Title order={2} ta="center">
            {t('auth.resetPassword.title', 'Reset your password')}
          </Title>

          {userEmail && (
            <Text c="dimmed" size="sm" ta="center">
              {t('auth.resetPassword.resettingFor', 'Resetting password for:')}{' '}
              <strong>{userEmail}</strong>
            </Text>
          )}

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('auth.resetPassword.errors.title', 'Error')}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <PasswordInput
                label={t('auth.resetPassword.newPasswordLabel', 'New password')}
                placeholder={t('auth.resetPassword.newPasswordPlaceholder', 'Enter new password')}
                required
                disabled={loading}
                {...form.getInputProps('password')}
              />

              {form.values.password.length > 0 && (
                <Stack gap={5}>
                  <Progress
                    value={passwordStrength.score}
                    color={passwordStrength.color}
                    size="xs"
                  />
                  <Text size="xs" c={passwordStrength.color}>
                    {t(
                      `auth.resetPassword.strength.${passwordStrength.label.toLowerCase()}`,
                      passwordStrength.label
                    )}
                  </Text>
                </Stack>
              )}

              <PasswordInput
                label={t('auth.resetPassword.confirmPasswordLabel', 'Confirm password')}
                placeholder={t(
                  'auth.resetPassword.confirmPasswordPlaceholder',
                  'Confirm new password'
                )}
                required
                disabled={loading}
                {...form.getInputProps('confirmPassword')}
              />

              <Button fullWidth type="submit" loading={loading}>
                {t('auth.resetPassword.resetPassword', 'Reset password')}
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center">
            <Anchor component={Link} to="/auth/login" size="sm">
              {t('auth.resetPassword.backToLogin', 'Back to login')}
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
