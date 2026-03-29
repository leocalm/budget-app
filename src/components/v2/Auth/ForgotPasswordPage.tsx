import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core';
import { useForgotPassword } from '@/hooks/v2/usePasswordReset';

export function V2ForgotPasswordPage() {
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
          Check your email
        </Text>
        <Text fz="sm" c="dimmed">
          We&apos;ve sent a password reset link to{' '}
          <Text span fw={600}>
            {email}
          </Text>
          .
        </Text>
        <Text fz="sm" c="dimmed">
          Click the link in the email to reset your password.
        </Text>
        <Text fz="xs" c="dimmed" mt="md">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <Anchor
            c="var(--v2-primary)"
            onClick={() => {
              setSent(false);
              forgotMutation.reset();
            }}
          >
            resend the link
          </Anchor>
        </Text>
        <Anchor component={Link} to="/v2/auth/login" fz="sm" c="var(--v2-primary)" mt="md">
          Back to Sign in
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        Forgot your password?
      </Text>
      <Text fz="sm" c="dimmed">
        Enter your email and we&apos;ll send you a link to reset it.
      </Text>

      <TextInput
        label="Email"
        placeholder="you@example.com"
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
        Send Reset Link
      </Button>

      <Text fz="sm" c="dimmed" ta="center" mt="md">
        Remember your password?{' '}
        <Anchor component={Link} to="/v2/auth/login" c="var(--v2-primary)" fw={600}>
          Sign in
        </Anchor>
      </Text>
    </Stack>
  );
}
