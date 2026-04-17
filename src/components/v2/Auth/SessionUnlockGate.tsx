import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Center, Loader, Paper, PasswordInput, Stack, Text } from '@mantine/core';
import { useAuth } from '@/context/AuthContext';
import { useEncryption } from '@/context/EncryptionContext';

// Fallback unlock surface shown when the user has a live session cookie but
// the tab no longer has the DEK in sessionStorage (e.g. opened in a new tab,
// browser restart). We prompt for the password, derive the KEK, unwrap the
// DEK, and push it back to the server.
export function SessionUnlockGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation('v2');
  const { user } = useAuth();
  const { isUnlocked, isReady, unlockWithPassword } = useEncryption();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await unlockWithPassword(password);
    } catch {
      setError(
        t(
          'auth.unlock.errorIncorrectPassword',
          "We couldn't unlock your data with that password. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh', padding: 'var(--mantine-spacing-lg)' }}>
      <Paper withBorder shadow="sm" p="xl" radius="md" style={{ maxWidth: 420, width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Text fz={22} fw={700} ff="var(--mantine-font-family-headings)">
              {t('auth.unlock.title', 'Unlock your data')}
            </Text>
            <Text fz="sm" c="dimmed">
              {t(
                'auth.unlock.subtitle',
                'Your account is protected with end-to-end encryption. Enter your password to decrypt your financial data on this device.'
              )}
            </Text>

            {user?.email && (
              <Text fz="sm" c="dimmed">
                {user.email}
              </Text>
            )}

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <PasswordInput
              data-testid="unlock-password"
              label={t('auth.unlock.passwordLabel', 'Password')}
              placeholder={t('auth.unlock.passwordPlaceholder', 'Your account password')}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoFocus
            />

            <Button
              data-testid="unlock-submit"
              type="submit"
              loading={submitting}
              disabled={!password}
              fullWidth
            >
              {t('auth.unlock.submitButton', 'Unlock')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
