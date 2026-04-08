import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { useResetPassword } from '@/hooks/v2/usePasswordReset';
import { toast } from '@/lib/toast';
import { PasswordStrengthBar } from './PasswordStrengthBar';
import classes from './Auth.module.css';

export function V2ResetPasswordPage() {
  const { t } = useTranslation('v2');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetMutation = useResetPassword();
  const { evaluate } = usePasswordStrength();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  // Remove token from URL for security
  useEffect(() => {
    if (token) {
      window.history.replaceState({}, '', '/auth/reset-password');
    }
  }, [token]);

  const strength = evaluate(password);
  const isValid = strength.isStrong && password === confirmPassword && token;

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }
    try {
      await resetMutation.mutateAsync({ token, password });
      setSuccess(true);
    } catch {
      toast.error({ message: t('auth.resetPassword.errorExpired') });
    }
  };

  if (success) {
    return (
      <div className={classes.successContent}>
        <Text fz={32}>✓</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.resetPassword.successTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.resetPassword.successMessage')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.resetPassword.successSubtext')}
        </Text>
        <Button component={Link} to="/auth/login" size="md" mt="md">
          {t('auth.resetPassword.goToSignIn')}
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={classes.successContent}>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {t('auth.resetPassword.invalidLinkTitle')}
        </Text>
        <Text fz="sm" c="dimmed">
          {t('auth.resetPassword.invalidLinkMessage')}
        </Text>
        <Button component={Link} to="/auth/forgot-password" size="md" mt="md">
          {t('auth.resetPassword.requestNewLink')}
        </Button>
      </div>
    );
  }

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.resetPassword.title')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.resetPassword.subtitle')}
      </Text>

      <div>
        <TextInput
          label={t('auth.resetPassword.newPasswordLabel')}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          type="password"
        />
        {password && <PasswordStrengthBar score={strength.score} />}
      </div>
      <TextInput
        label={t('auth.resetPassword.confirmPasswordLabel')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        type="password"
        error={
          confirmPassword && password !== confirmPassword
            ? t('auth.resetPassword.passwordsDoNotMatch')
            : undefined
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isValid) {
            handleSubmit();
          }
        }}
      />

      <Button
        onClick={handleSubmit}
        loading={resetMutation.isPending}
        fullWidth
        size="md"
        disabled={!isValid}
      >
        {t('auth.resetPassword.submitButton')}
      </Button>
    </Stack>
  );
}
