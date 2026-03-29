import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Stack, Text, TextInput } from '@mantine/core';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { useResetPassword } from '@/hooks/v2/usePasswordReset';
import { toast } from '@/lib/toast';
import { PasswordStrengthBar } from './PasswordStrengthBar';
import classes from './Auth.module.css';

export function V2ResetPasswordPage() {
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
      window.history.replaceState({}, '', '/v2/auth/reset-password');
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
      toast.error({ message: 'Reset link has expired. Please request a new one.' });
    }
  };

  if (success) {
    return (
      <div className={classes.successContent}>
        <Text fz={32}>✓</Text>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          Password updated
        </Text>
        <Text fz="sm" c="dimmed">
          Your password has been reset successfully.
        </Text>
        <Text fz="sm" c="dimmed">
          You can now sign in with your new password.
        </Text>
        <Button component={Link} to="/v2/auth/login" size="md" mt="md">
          Go to Sign In
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={classes.successContent}>
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          Invalid reset link
        </Text>
        <Text fz="sm" c="dimmed">
          This link has expired or is invalid.
        </Text>
        <Button component={Link} to="/v2/auth/forgot-password" size="md" mt="md">
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        Set a new password
      </Text>
      <Text fz="sm" c="dimmed">
        Make it strong and unique.
      </Text>

      <div>
        <TextInput
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          type="password"
        />
        {password && <PasswordStrengthBar score={strength.score} />}
      </div>
      <TextInput
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        type="password"
        error={
          confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
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
        Reset Password
      </Button>
    </Stack>
  );
}
