import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Anchor, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { apiClient } from '@/api/v2client';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/v2/useAuth';
import { toast } from '@/lib/toast';
import classes from './Auth.module.css';

export function V2LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const loginMutation = useLogin();
  const [verifying2FA, setVerifying2FA] = useState(false);

  const isSessionExpired = location.state?.sessionExpired === true;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const redirectPath = (location.state?.from as string) ?? '/v2/dashboard';

  const handleLogin = async () => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.requiresTwoFactor === 'true') {
        setTwoFactorToken(result.twoFactorToken);
        setRequires2FA(true);
        return;
      }
      await refreshUser(rememberMe);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast.error({ message: 'Invalid email or password' });
        } else if (err.status === 429) {
          toast.error({ message: 'Too many attempts. Please wait and try again.' });
        } else if (err.status === 423) {
          toast.error({ message: 'Account locked. Check your email for an unlock link.' });
        } else {
          toast.error({ message: 'Unable to sign in. Please try again.' });
        }
      } else {
        toast.error({ message: 'Something went wrong' });
      }
    }
  };

  const handle2FAVerify = async () => {
    setVerifying2FA(true);
    try {
      const { data, error } = await apiClient.POST('/auth/2fa/verify', {
        body: { twoFactorToken, code: code.trim() },
      });
      if (error) {
        throw error;
      }
      if (data) {
        await refreshUser(rememberMe);
        navigate(redirectPath, { replace: true });
      }
    } catch {
      toast.error({ message: 'Invalid code. Please try again.' });
    } finally {
      setVerifying2FA(false);
    }
  };

  // 2FA code entry screen
  if (requires2FA) {
    return (
      <Stack gap="md">
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {useRecoveryCode ? 'Recovery code' : 'Enter verification code'}
        </Text>
        <Text fz="sm" c="dimmed">
          {useRecoveryCode
            ? 'Enter one of your recovery codes.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </Text>

        <TextInput
          placeholder={useRecoveryCode ? 'XXXX-XXXX' : '000000'}
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          className={useRecoveryCode ? undefined : classes.codeInput}
          size="lg"
          maxLength={useRecoveryCode ? 20 : 6}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handle2FAVerify();
            }
          }}
        />

        <Button onClick={handle2FAVerify} loading={verifying2FA} fullWidth>
          Verify
        </Button>

        <Text fz="sm" ta="center">
          <Anchor c="var(--v2-primary)" onClick={() => setUseRecoveryCode(!useRecoveryCode)}>
            {useRecoveryCode ? 'Use authenticator code instead' : 'Or use a recovery code'}
          </Anchor>
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {isSessionExpired && (
        <div className={classes.expiredBanner}>
          <Text fz="sm" fw={500} c="#c48ba0">
            Your session has expired. Please sign in again.
          </Text>
        </div>
      )}

      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        Sign in
      </Text>
      <Text fz="sm" c="dimmed">
        Access your financial pulse.
      </Text>

      <TextInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
      />
      <TextInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        type="password"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleLogin();
          }
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.currentTarget.checked)}
          size="sm"
        />
        <Anchor
          component={Link}
          to="/v2/auth/forgot-password"
          fz="sm"
          fw={600}
          c="var(--v2-primary)"
        >
          Forgot password?
        </Anchor>
      </div>

      <Button onClick={handleLogin} loading={loginMutation.isPending} fullWidth size="md">
        Sign In
      </Button>

      <div className={classes.footerLink}>
        <Text fz="sm" c="dimmed">
          Don&apos;t have an account?{' '}
          <Anchor component={Link} to="/v2/auth/register" c="var(--v2-primary)" fw={600}>
            Create one
          </Anchor>
        </Text>
      </div>
    </Stack>
  );
}
