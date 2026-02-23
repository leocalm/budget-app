import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { requestPasswordReset } from '@/api/passwordReset';
import { sleep } from '@/utils/time';
import { AuthCard, AuthMessage } from './AuthCard';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val)
          ? null
          : t('auth.forgotPassword.validation.invalidEmail', 'Invalid email address'),
    },
  });

  const successMessage = t(
    'auth.forgotPassword.success.message',
    'If the email is registered, you will receive a reset link shortly.'
  );

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setMessage(null);

    try {
      await Promise.all([requestPasswordReset(values.email), sleep(400)]);
    } catch {
      // Intentionally swallowed — always show the same neutral message
    } finally {
      setLoading(false);
      setSubmitted(true);
      setMessage(successMessage);
      form.reset();
    }
  };

  return (
    <AuthCard>
      <Title order={2} ta="center">
        {t('auth.forgotPassword.title', 'Password recovery')}
      </Title>
      <Text size="sm" c="dimmed" ta="center">
        {t(
          'auth.forgotPassword.description',
          'Enter your email address. If it is registered, you will receive a reset link.'
        )}
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('auth.forgotPassword.emailLabel', 'Email')}
            placeholder={t('auth.forgotPassword.emailPlaceholder', 'name@example.com')}
            required
            disabled={loading || submitted}
            {...form.getInputProps('email')}
          />
          <Button fullWidth type="submit" loading={loading} disabled={submitted}>
            {loading
              ? t('auth.forgotPassword.sending', 'Sending…')
              : t('auth.forgotPassword.sendResetLink', 'Send link')}
          </Button>
        </Stack>
      </form>
      <AuthMessage message={message} />
      <Text size="sm" c="dimmed" ta="center">
        <Anchor component={Link} to="/auth/login" size="sm">
          {t('auth.forgotPassword.backToLogin', 'Back to login')}
        </Anchor>
      </Text>
    </AuthCard>
  );
}
