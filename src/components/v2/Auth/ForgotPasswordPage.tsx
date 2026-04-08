import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { useForgotPassword } from '@/hooks/v2/usePasswordReset';

export function V2ForgotPasswordPage() {
  const { t } = useTranslation('v2');
  const forgotMutation = useForgotPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    try {
      await forgotMutation.mutateAsync({ email });
    } catch {
      // Always show sent state to prevent email enumeration
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Stack gap="md" ta="center">
        <Text fz={32}>📧</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.forgotPassword.sentTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.forgotPassword.sentSubtitle')}{' '}
          <Text span fw={600}>
            {email}
          </Text>
          .
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.forgotPassword.sentInstruction')}
        </Text>
        <Text fz="xs" c="dimmed" mt="md">
          {t('auth.forgotPassword.didNotReceive')}{' '}
          <Anchor
            c="var(--v2-primary)"
            onClick={() => {
              setSent(false);
              forgotMutation.reset();
            }}
          >
            {t('auth.forgotPassword.resendLink')}
          </Anchor>
        </Text>
        <Anchor component={Link} to="/auth/login" fz="sm" c="var(--v2-primary)" mt="md">
          {t('auth.forgotPassword.backToSignIn')}
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.forgotPassword.title')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.forgotPassword.subtitle')}
      </Text>

      <TextInput
        label={t('auth.forgotPassword.emailLabel')}
        placeholder={t('auth.forgotPassword.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && email) {
            handleSubmit();
          }
        }}
      />

      <Button
        onClick={handleSubmit}
        loading={forgotMutation.isPending}
        fullWidth
        size="md"
        disabled={!email}
      >
        {t('auth.forgotPassword.submitButton')}
      </Button>

      <Text fz="sm" c="dimmed" ta="center" mt="md">
        {t('auth.forgotPassword.rememberPassword')}{' '}
        <Anchor component={Link} to="/auth/login" c="var(--v2-primary)" fw={600}>
          {t('auth.forgotPassword.signIn')}
        </Anchor>
      </Text>
    </Stack>
  );
}
