import { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { register } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
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
      password: (val) => (val.length <= 6 ? t('auth.register.validation.passwordMinLength') : null),
      confirmPassword: (val, values) =>
        val !== values.password ? t('auth.register.validation.passwordsDoNotMatch') : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // Hydrate user from cookie-backed endpoint
      const refreshed = await refreshUser(false, false);
      if (!refreshed) {
        throw new Error(t('auth.register.errors.generic'));
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
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {t('auth.register.createAccountTitle')}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('auth.register.errors.title')}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

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
          <PasswordInput
            label={t('auth.register.passwordLabel')}
            placeholder={t('auth.register.passwordPlaceholder')}
            required
            disabled={loading}
            {...form.getInputProps('password')}
          />
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
    </Paper>
  );
}
