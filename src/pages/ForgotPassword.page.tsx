import { useState } from 'react';
import { IconAlertCircle, IconCheck, IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { requestPasswordReset } from '@/api/passwordReset';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val)
          ? null
          : t('auth.forgotPassword.validation.invalidEmail', 'Invalid email address'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestPasswordReset(values.email);
      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('auth.forgotPassword.errors.generic', 'Failed to send reset email')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack gap="md">
          <IconMail size={48} style={{ margin: '0 auto', color: 'var(--mantine-color-blue-6)' }} />

          <Title order={2} ta="center">
            {t('auth.forgotPassword.title', 'Forgot your password?')}
          </Title>

          <Text c="dimmed" size="sm" ta="center">
            {t(
              'auth.forgotPassword.description',
              "Enter your email address and we'll send you a link to reset your password."
            )}
          </Text>

          {success && (
            <Alert
              icon={<IconCheck size={16} />}
              title={t('auth.forgotPassword.success.title', 'Email sent!')}
              color="green"
              variant="light"
            >
              {t(
                'auth.forgotPassword.success.message',
                'If your email address exists in our system, you will receive a password reset link shortly. Please check your inbox and spam folder.'
              )}
            </Alert>
          )}

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('auth.forgotPassword.errors.title', 'Error')}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label={t('auth.forgotPassword.emailLabel', 'Email address')}
                placeholder={t('auth.forgotPassword.emailPlaceholder', 'your@email.com')}
                required
                disabled={loading || success}
                {...form.getInputProps('email')}
              />

              <Button fullWidth type="submit" loading={loading} disabled={success}>
                {t('auth.forgotPassword.sendResetLink', 'Send reset link')}
              </Button>
            </Stack>
          </form>

          <Stack gap="xs">
            <Text c="dimmed" size="sm" ta="center">
              <Anchor component={Link} to="/auth/login" size="sm">
                {t('auth.forgotPassword.backToLogin', 'Back to login')}
              </Anchor>
            </Text>

            <Text c="dimmed" size="sm" ta="center">
              {t('auth.forgotPassword.noAccountYet', "Don't have an account?")}{' '}
              <Anchor component={Link} to="/auth/register" size="sm">
                {t('auth.forgotPassword.createAccount', 'Create one')}
              </Anchor>
            </Text>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
