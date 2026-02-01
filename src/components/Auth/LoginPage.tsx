import { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
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
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin } = useAuth();
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
      const response = await login({
        email: values.email,
        password: values.password,
      });

      // Update auth context with user data
      authLogin(response.user, values.rememberMe);

      // Navigate to the page user was trying to access, or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {t('auth.login.welcomeBack')}
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
        </Stack>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        {t('auth.login.noAccountYet')}{' '}
        <Anchor component={Link} to="/auth/register" size="sm">
          {t('auth.login.createAccount')}
        </Anchor>
      </Text>
    </Paper>
  );
}
