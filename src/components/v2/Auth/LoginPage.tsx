import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Anchor, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { ApiError } from '@/api/errors';
import { apiClient } from '@/api/v2client';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/v2/useAuth';
import { toast } from '@/lib/toast';
import classes from './Auth.module.css';

export function V2LoginPage() {
  const { t } = useTranslation('v2');
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

  const redirectPath = (location.state?.from as string) ?? '/dashboard';

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
          toast.error({ message: t('auth.login.errorInvalidCredentials') });
        } else if (err.status === 429) {
          toast.error({ message: t('auth.login.errorTooManyAttempts') });
        } else if (err.status === 423) {
          toast.error({ message: t('auth.login.errorAccountLocked') });
        } else {
          toast.error({ message: t('auth.login.errorGeneric') });
        }
      } else {
        toast.error({ message: t('auth.login.errorUnknown') });
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
      toast.error({ message: t('auth.twoFactor.errorInvalidCode') });
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

        <Button onClick={handle2FAVerify} loading={verifying2FA} fullWidth>
          {t('auth.twoFactor.verifyButton')}
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

      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.login.title')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.login.subtitle')}
      </Text>

      <TextInput
        label={t('auth.login.emailLabel')}
        placeholder={t('auth.login.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
      />
      <TextInput
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

      <Button onClick={handleLogin} loading={loginMutation.isPending} fullWidth size="md">
        {t('auth.login.submitButton')}
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
