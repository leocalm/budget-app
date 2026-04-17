import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Anchor, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/v2/useAuth';
import { unlockWithPassword } from '@/lib/encryption';
import classes from './Auth.module.css';

export function V2LoginPage() {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const loginMutation = useLogin();
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [loginError, setLoginError] = useState('');
  const rateLimitTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitSeconds > 0) {
      rateLimitTimer.current = setInterval(() => {
        setRateLimitSeconds((s) => {
          if (s <= 1) {
            if (rateLimitTimer.current) {
              clearInterval(rateLimitTimer.current);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => {
        if (rateLimitTimer.current) {
          clearInterval(rateLimitTimer.current);
        }
      };
    }
  }, [rateLimitSeconds]);

  const isSessionExpired = location.state?.sessionExpired === true;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const redirectPath = (location.state?.from as string) ?? '/dashboard';

  const handleLogin = async () => {
    setLoginError('');
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if ('twoFactorToken' in result && result.twoFactorToken) {
        setTwoFactorToken(result.twoFactorToken);
        setRequires2FA(true);
        return;
      }
      await refreshUser(rememberMe);
      try {
        await unlockWithPassword(password);
      } catch (unlockError) {
        console.error('Failed to unlock encryption after login', unlockError);
        setLoginError(
          t(
            'auth.unlock.errorOnLogin',
            "Signed in, but we couldn't decrypt your data. Please try again."
          )
        );
        return;
      }
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown> | undefined;
      const errorCode = errorObj?.error as string | undefined;

      if (errorCode === 'too_many_attempts') {
        const retryAfter = Number(errorObj?.retry_after_seconds) || 60;
        setRateLimitSeconds(retryAfter);
      } else if (errorCode === 'account_locked') {
        setRateLimitSeconds(-1);
      } else {
        setLoginError(t('auth.login.errorInvalidCredentials'));
      }
    }
  };

  const handle2FAVerify = async () => {
    setVerifying2FA(true);
    setLoginError('');
    try {
      // Omit credentials to avoid hitting the authenticated setup-verify
      // route (rank 1). The login 2FA verify is unauthenticated (rank 2).
      const { v2BaseUrl: baseUrl } = await import('@/api/v2client');
      const response = await fetch(`${baseUrl}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ twoFactorToken, code: code.trim() }),
      });
      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore parse errors
        }
        if (errorData.error === 'too_many_attempts') {
          const retryAfter = Number(errorData.retry_after_seconds) || 60;
          setRateLimitSeconds(retryAfter);
        } else if (errorData.error === 'account_locked') {
          setRateLimitSeconds(-1);
        } else {
          setLoginError(t('auth.twoFactor.errorInvalidCode'));
        }
        return;
      }
      await refreshUser(rememberMe);
      try {
        await unlockWithPassword(password);
      } catch (unlockError) {
        console.error('Failed to unlock encryption after 2FA', unlockError);
        setLoginError(
          t(
            'auth.unlock.errorOnLogin',
            "Signed in, but we couldn't decrypt your data. Please try again."
          )
        );
        return;
      }
      navigate(redirectPath, { replace: true });
    } catch {
      setLoginError(t('auth.twoFactor.errorInvalidCode'));
    } finally {
      setVerifying2FA(false);
    }
  };

  // 2FA code entry screen
  if (requires2FA) {
    return (
      <Stack gap="md">
        <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
          {useRecoveryCode ? t('auth.twoFactor.recoveryTitle') : t('auth.twoFactor.title')}
        </Text>
        <Text fz="sm" c="dimmed">
          {useRecoveryCode ? t('auth.twoFactor.recoverySubtitle') : t('auth.twoFactor.subtitle')}
        </Text>

        {rateLimitSeconds === -1 && (
          <Alert color="red" variant="light">
            {t(
              'auth.twoFactor.accountLocked',
              'Your account has been temporarily locked due to too many failed attempts. Check your email for unlock instructions.'
            )}
          </Alert>
        )}

        {rateLimitSeconds > 0 && (
          <Alert color="orange" variant="light">
            {t(
              'auth.twoFactor.tooManyAttempts',
              'Too many failed attempts. Please wait {{seconds}} seconds before trying again.'
            ).replace('{{seconds}}', String(rateLimitSeconds))}
          </Alert>
        )}

        {loginError && rateLimitSeconds === 0 && (
          <Alert color="red" variant="light">
            {loginError}
          </Alert>
        )}

        <TextInput
          placeholder={
            useRecoveryCode
              ? t('auth.twoFactor.recoveryPlaceholder')
              : t('auth.twoFactor.placeholder')
          }
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

        <Button
          onClick={handle2FAVerify}
          loading={verifying2FA}
          fullWidth
          disabled={rateLimitSeconds !== 0}
        >
          {rateLimitSeconds > 0
            ? t('auth.twoFactor.waitSeconds', 'Wait {{seconds}}s').replace(
                '{{seconds}}',
                String(rateLimitSeconds)
              )
            : t('auth.twoFactor.verifyButton')}
        </Button>

        <Text fz="sm" ta="center">
          <Anchor c="var(--v2-primary)" onClick={() => setUseRecoveryCode(!useRecoveryCode)}>
            {useRecoveryCode
              ? t('auth.twoFactor.useAuthenticator')
              : t('auth.twoFactor.useRecoveryCode')}
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
            {t('auth.login.sessionExpired')}
          </Text>
        </div>
      )}

      {rateLimitSeconds === -1 && (
        <Alert color="red" variant="light">
          {t(
            'auth.login.accountLockedAlert',
            'Your account has been temporarily locked due to too many failed attempts. Check your email for unlock instructions.'
          )}
        </Alert>
      )}

      {rateLimitSeconds > 0 && (
        <Alert color="orange" variant="light">
          {t(
            'auth.login.tooManyAttemptsAlert',
            'Too many failed attempts. Please wait {{seconds}} seconds before trying again.'
          ).replace('{{seconds}}', String(rateLimitSeconds))}
        </Alert>
      )}

      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.login.title')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.login.subtitle')}
      </Text>

      {loginError && rateLimitSeconds === 0 && (
        <Alert color="red" variant="light">
          {loginError}
        </Alert>
      )}

      <TextInput
        data-testid="login-email"
        label={t('auth.login.emailLabel')}
        placeholder={t('auth.login.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
      />
      <TextInput
        data-testid="login-password"
        label={t('auth.login.passwordLabel')}
        placeholder={t('auth.login.passwordPlaceholder')}
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
          label={t('auth.login.rememberMe')}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.currentTarget.checked)}
          size="sm"
        />
        <Anchor component={Link} to="/auth/forgot-password" fz="sm" fw={600} c="var(--v2-primary)">
          {t('auth.login.forgotPassword')}
        </Anchor>
      </div>

      <Button
        data-testid="login-submit"
        onClick={handleLogin}
        loading={loginMutation.isPending}
        fullWidth
        size="md"
        disabled={rateLimitSeconds !== 0}
      >
        {rateLimitSeconds > 0
          ? t('auth.login.waitSeconds', 'Wait {{seconds}}s').replace(
              '{{seconds}}',
              String(rateLimitSeconds)
            )
          : t('auth.login.submitButton')}
      </Button>

      <div className={classes.footerLink}>
        <Text fz="sm" c="dimmed">
          {t('auth.login.noAccount')}{' '}
          <Anchor component={Link} to="/auth/register" c="var(--v2-primary)" fw={600}>
            {t('auth.login.createOne')}
          </Anchor>
        </Text>
      </div>
    </Stack>
  );
}
