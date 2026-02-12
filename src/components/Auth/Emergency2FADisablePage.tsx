import { useState } from 'react';
import { IconAlertCircle, IconCheck, IconShieldOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { confirmEmergencyDisable, requestEmergencyDisable } from '@/api/twoFactor';

export function Emergency2FADisablePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Please enter a valid email address'),
    },
  });

  const handleRequestSubmit = async (values: typeof requestForm.values) => {
    setLoading(true);
    setError(null);

    try {
      await requestEmergencyDisable(values.email);
      setSuccess(true);
      notifications.show({
        title: t('common.success'),
        message: 'If your email exists and has 2FA enabled, you will receive instructions shortly.',
        color: 'green',
        icon: <IconCheck size={20} />,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request emergency disable');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!token) {
      setError('Invalid token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmEmergencyDisable(token);
      setSuccess(true);
      notifications.show({
        title: t('common.success'),
        message:
          'Two-factor authentication has been disabled. You can now log in with just your password.',
        color: 'green',
        icon: <IconCheck size={20} />,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Center>
          <IconCheck size={64} color="green" />
        </Center>
        <Title order={2} ta="center" mt="md" mb={20}>
          {token ? '2FA Disabled Successfully' : 'Request Sent'}
        </Title>
        <Text c="dimmed" fz="sm" ta="center" mb="xl">
          {token
            ? 'Two-factor authentication has been disabled on your account. You can log in with just your password now.'
            : 'If your email exists in our system and has 2FA enabled, you will receive a confirmation link shortly.'}
        </Text>
        <Group justify="center" mt="lg">
          <Anchor component={Link} to="/auth/login" size="sm">
            <Center inline>
              <span style={{ fontSize: 12, marginRight: 5 }}>⬅️</span>
              <Box ml={5}>Back to Login</Box>
            </Center>
          </Anchor>
        </Group>
      </Paper>
    );
  }

  // Confirm flow (with token)
  if (token) {
    return (
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title order={2} ta="center" mt="md" mb={20}>
          <IconShieldOff size={32} style={{ marginBottom: 8 }} />
          <br />
          Disable Two-Factor Authentication
        </Title>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Warning"
          color="yellow"
          variant="light"
          mb="md"
        >
          You are about to disable two-factor authentication on your account. This will make your
          account less secure.
        </Alert>

        <Text size="sm" mb="xl">
          Click the button below to confirm that you want to disable two-factor authentication. You
          can re-enable it at any time from your account settings.
        </Text>

        <Button
          fullWidth
          color="red"
          leftSection={<IconShieldOff size={16} />}
          onClick={handleConfirmSubmit}
          loading={loading}
        >
          Confirm Disable 2FA
        </Button>

        <Group justify="center" mt="lg">
          <Anchor component={Link} to="/auth/login" size="sm" c="dimmed">
            <Center inline>
              <span style={{ fontSize: 12, marginRight: 5 }}>⬅️</span>
              <Box ml={5}>Back to Login</Box>
            </Center>
          </Anchor>
        </Group>
      </Paper>
    );
  }

  // Request flow (no token)
  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={20}>
        Emergency 2FA Disable
      </Title>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Lost Access?"
        color="blue"
        variant="light"
        mb="md"
      >
        If you've lost access to your authenticator app and cannot log in, we can help you disable
        two-factor authentication via email.
      </Alert>

      <Text c="dimmed" fz="sm" ta="center" mb="md">
        Enter your email address and we'll send you a secure link to disable 2FA. You'll be able to
        log in with just your password after that.
      </Text>

      <form onSubmit={requestForm.onSubmit(handleRequestSubmit)}>
        <TextInput
          label="Email Address"
          placeholder="your.email@example.com"
          required
          disabled={loading}
          {...requestForm.getInputProps('email')}
        />
        <Button fullWidth mt="xl" type="submit" loading={loading}>
          Send Disable Link
        </Button>
      </form>

      <Group justify="center" mt="lg">
        <Anchor component={Link} to="/auth/login" size="sm" c="dimmed">
          <Center inline>
            <span style={{ fontSize: 12, marginRight: 5 }}>⬅️</span>
            <Box ml={5}>Back to Login</Box>
          </Center>
        </Anchor>
      </Group>
    </Paper>
  );
}
