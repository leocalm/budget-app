import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Anchor, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { register } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { usePasswordStrength, type PasswordStrengthResult } from '@/hooks/usePasswordStrength';
import { sleep } from '@/utils/time';
import { AuthCard, AuthMessage } from './AuthCard';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshUser } = useAuth();
  const { evaluate: evaluatePassword } = usePasswordStrength();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (val) => (val.length < 2 ? t('auth.register.validation.nameMinLength') : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.register.validation.invalidEmail')),
      password: (val) => {
        const strength = evaluatePassword(val);
        if (!strength.isStrong) {
          return t('auth.register.validation.passwordStrengthInsufficient');
        }
        return null;
      },
      confirmPassword: (val, values) =>
        val !== values.password ? t('auth.register.validation.passwordsDoNotMatch') : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        register({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
        sleep(400),
      ]);

      // Hydrate user from cookie-backed endpoint
      const refreshed = await refreshUser(false, false);
      if (!refreshed) {
        setError(t('auth.register.errors.generic'));
        return;
      }

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.register.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <Text role="heading" fw={600} size="lg" ta="center">
        {t('auth.register.createAccountTitle')}
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <AuthMessage message={error} />

          <TextInput
            label={t('auth.register.fullNameLabel')}
            placeholder={t('auth.register.fullNamePlaceholder')}
            required
            disabled={loading}
            {...form.getInputProps('name')}
          />
          <TextInput
            label={t('auth.register.emailLabel')}
            placeholder={t('auth.register.emailPlaceholder')}
            required
            disabled={loading}
            {...form.getInputProps('email')}
          />
          <Stack gap="xs">
            <PasswordInput
              label={t('auth.register.passwordLabel')}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              disabled={loading}
              onBlur={(e) => {
                const password = e.currentTarget.value;
                setPasswordStrength(evaluatePassword(password));
              }}
              onChange={(e) => {
                form.setFieldValue('password', e.currentTarget.value);
                // Update strength in real-time
                if (e.currentTarget.value) {
                  setPasswordStrength(evaluatePassword(e.currentTarget.value));
                }
              }}
              value={form.values.password}
              error={form.errors.password}
            />
            <PasswordStrengthIndicator result={passwordStrength} />
          </Stack>
          <PasswordInput
            label={t('auth.register.confirmPasswordLabel')}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            required
            disabled={loading}
            {...form.getInputProps('confirmPassword')}
          />
          <Button fullWidth type="submit" loading={loading}>
            {t('auth.register.registerButton')}
          </Button>
        </Stack>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        {t('auth.register.alreadyHaveAccount')}{' '}
        <Anchor component={Link} to="/auth/login" size="sm">
          {t('auth.register.login')}
        </Anchor>
      </Text>
    </AuthCard>
  );
}
