import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { useRegister } from '@/hooks/v2/useAuth';
import { useCurrencies } from '@/hooks/v2/useCurrencies';
import { toast } from '@/lib/toast';
import { PasswordStrengthBar } from './PasswordStrengthBar';

export function V2RegisterPage() {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const registerMutation = useRegister();
  const { data: currencies } = useCurrencies();
  const { evaluate } = usePasswordStrength();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const strength = evaluate(password);
  const defaultCurrencyId = currencies?.[0]?.id ?? '';

  const isValid =
    name.trim().length >= 1 &&
    email.includes('@') &&
    strength.isStrong &&
    password === confirmPassword &&
    agreedToTerms &&
    defaultCurrencyId;

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        name: name.trim(),
        currencyId: defaultCurrencyId,
      });
      await refreshUser(true);
      navigate('/onboarding', { replace: true });
    } catch {
      toast.error({ message: t('auth.register.errorGeneric') });
    }
  };

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        {t('auth.register.title')}
      </Text>
      <Text fz="sm" c="dimmed">
        {t('auth.register.subtitle')}
      </Text>

      <TextInput
        data-testid="register-name"
        label={t('auth.register.nameLabel')}
        placeholder={t('auth.register.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <TextInput
        data-testid="register-email"
        label={t('auth.register.emailLabel')}
        placeholder={t('auth.register.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
      />
      <div>
        <TextInput
          data-testid="register-password"
          label={t('auth.register.passwordLabel')}
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          type="password"
        />
        {password && <PasswordStrengthBar score={strength.score} />}
      </div>
      <TextInput
        data-testid="register-confirm-password"
        label={t('auth.register.confirmPasswordLabel')}
        placeholder={t('auth.register.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        type="password"
        error={
          confirmPassword && password !== confirmPassword
            ? t('auth.register.passwordsDoNotMatch')
            : undefined
        }
      />

      <Checkbox
        label={
          <Text fz="sm" c="dimmed">
            {t('auth.register.agreeToTermsPrefix')}{' '}
            <Anchor c="var(--v2-primary)" href="#" target="_blank">
              {t('auth.register.termsOfService')}
            </Anchor>{' '}
            {t('auth.register.and')}{' '}
            <Anchor c="var(--v2-primary)" href="#" target="_blank">
              {t('auth.register.privacyPolicy')}
            </Anchor>
          </Text>
        }
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.currentTarget.checked)}
        size="sm"
      />

      <Button
        data-testid="register-submit"
        onClick={handleSubmit}
        loading={registerMutation.isPending || !currencies}
        fullWidth
        size="md"
        disabled={!isValid}
      >
        {t('auth.register.submitButton')}
      </Button>

      <div style={{ textAlign: 'center', marginTop: 'var(--mantine-spacing-md)' }}>
        <Text fz="sm" c="dimmed">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Anchor component={Link} to="/auth/login" c="var(--v2-primary)" fw={600}>
            {t('auth.register.signIn')}
          </Anchor>
        </Text>
      </div>
    </Stack>
  );
}
