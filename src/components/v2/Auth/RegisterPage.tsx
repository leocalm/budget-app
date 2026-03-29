import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Checkbox, Stack, Text, TextInput } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { usePasswordStrength } from '@/hooks/usePasswordStrength';
import { useRegister } from '@/hooks/v2/useAuth';
import { useCurrencies } from '@/hooks/v2/useCurrencies';
import { toast } from '@/lib/toast';
import { PasswordStrengthBar } from './PasswordStrengthBar';

export function V2RegisterPage() {
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
      navigate('/v2/onboarding', { replace: true });
    } catch {
      toast.error({ message: 'Could not create account. Email may already be in use.' });
    }
  };

  return (
    <Stack gap="md">
      <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
        Create your account
      </Text>
      <Text fz="sm" c="dimmed">
        Start your calm budgeting journey.
      </Text>

      <TextInput
        label="Name"
        placeholder="Leonardo"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <TextInput
        label="Email"
        placeholder="leo@example.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        type="email"
      />
      <div>
        <TextInput
          label="Password"
          placeholder="MyStr0ngP@ss!"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          type="password"
        />
        {password && <PasswordStrengthBar score={strength.score} />}
      </div>
      <TextInput
        label="Confirm password"
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        type="password"
        error={
          confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
        }
      />

      <Checkbox
        label={
          <Text fz="sm" c="dimmed">
            I agree to the{' '}
            <Anchor c="var(--v2-primary)" href="#" target="_blank">
              Terms of Service
            </Anchor>{' '}
            and{' '}
            <Anchor c="var(--v2-primary)" href="#" target="_blank">
              Privacy Policy
            </Anchor>
          </Text>
        }
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.currentTarget.checked)}
        size="sm"
      />

      <Button
        onClick={handleSubmit}
        loading={registerMutation.isPending || !currencies}
        fullWidth
        size="md"
        disabled={!isValid}
      >
        Create Account
      </Button>

      <div style={{ textAlign: 'center', marginTop: 'var(--mantine-spacing-md)' }}>
        <Text fz="sm" c="dimmed">
          Already have an account?{' '}
          <Anchor component={Link} to="/v2/auth/login" c="var(--v2-primary)" fw={600}>
            Sign in
          </Anchor>
        </Text>
      </div>
    </Stack>
  );
}
