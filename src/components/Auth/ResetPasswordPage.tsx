import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { confirmPasswordReset, validatePasswordResetToken } from '@/api/passwordReset';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { sleep } from '@/utils/time';
import { AuthCard, AuthMessage } from './AuthCard';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token'));

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { evaluate } = usePasswordStrength();

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (val) => {
        if (val.length < 12) {
          return t(
            'auth.resetPassword.validation.passwordMinLength',
            'Password must be at least 12 characters'
          );
        }
        const result = evaluate(val);
        if (!result.isStrong) {
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
        setValidating(false);
        return;
      }

      try {
        const response = await validatePasswordResetToken(token);
        if (response.valid) {
          setTokenValid(true);
        }
      } catch {
        // token stays invalid
      } finally {
        setValidating(false);
      }
    };

    void validate();
  }, [token]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) {
      setError(t('auth.resetPassword.errors.noToken', 'No reset token found'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await Promise.all([confirmPasswordReset(token, values.password), sleep(400)]);
      const msg = t(
        'auth.resetPassword.success.message',
        'Password updated successfully. Redirecting to login.'
      );
      setSuccessMsg(msg);

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

  // Validating state
  if (validating) {
    return (
      <AuthCard>
        <Text c="dimmed" ta="center" size="sm">
          {t('auth.resetPassword.validating', 'Verifying reset link\u2026')}
        </Text>
      </AuthCard>
    );
  }

  // Invalid/expired token state
  if (!tokenValid) {
    return (
      <AuthCard>
        <AuthMessage
          message={t(
            'auth.resetPassword.errors.invalidToken',
            'Reset link is no longer valid. Request a new one.'
          )}
        />
        <Stack gap="xs">
          <Button component={Link} to="/auth/forgot-password" fullWidth>
            {t('auth.resetPassword.requestNew', 'Request new reset link')}
          </Button>
          <Button component={Link} to="/auth/login" variant="subtle" fullWidth>
            {t('auth.resetPassword.backToLogin', 'Back to login')}
          </Button>
        </Stack>
      </AuthCard>
    );
  }

  // Main form state
  const strengthResult = form.values.password.length > 0 ? evaluate(form.values.password) : null;

  return (
    <AuthCard>
      <Title order={2} ta="center">
        {t('auth.resetPassword.title', 'Create new password')}
      </Title>

      {successMsg ? (
        <AuthMessage message={successMsg} />
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Stack gap="xs">
              <PasswordInput
                label={t('auth.resetPassword.newPasswordLabel', 'New password')}
                placeholder={t('auth.resetPassword.newPasswordPlaceholder', 'Create password')}
                required
                disabled={loading}
                {...form.getInputProps('password')}
              />
              <Text size="xs" c="dimmed">
                {t('auth.resetPassword.hint.minLength', 'Use at least 12 characters.')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('auth.resetPassword.hint.variety', 'Include letters and numbers.')}
              </Text>
              <PasswordStrengthIndicator result={strengthResult} />
            </Stack>

            <PasswordInput
              label={t('auth.resetPassword.confirmPasswordLabel', 'Confirm password')}
              placeholder={t('auth.resetPassword.confirmPasswordPlaceholder', 'Repeat password')}
              required
              disabled={loading}
              {...form.getInputProps('confirmPassword')}
            />

            <AuthMessage message={error} />

            <Button fullWidth type="submit" loading={loading}>
              {loading
                ? t('auth.resetPassword.updating', 'Updating\u2026')
                : t('auth.resetPassword.resetPassword', 'Update password')}
            </Button>
          </Stack>
        </form>
      )}
    </AuthCard>
  );
}
