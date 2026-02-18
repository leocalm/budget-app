import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconQrcode,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Code,
  Group,
  Loader,
  Modal,
  Paper,
  PinInput,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';
import { setupTwoFactor, verifyTwoFactor } from '@/api/twoFactor';
import { toast } from '@/lib/toast';

interface TwoFactorSetupProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorSetup({ opened, onClose, onSuccess }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Trigger setup when modal opens
  useEffect(() => {
    if (!opened || secret) {
      return;
    }

    let isCancelled = false;

    const initializeTwoFactorSetup = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await setupTwoFactor();
        if (isCancelled) {
          return;
        }

        setSecret(response.secret);
        setQrCode(response.qrCode);
        setBackupCodes(response.backupCodes);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void initializeTwoFactorSetup();

    return () => {
      isCancelled = true;
    };
  }, [opened, secret]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyTwoFactor(verificationCode);
      toast.success({
        title: t('common.success'),
        message: 'Two-factor authentication enabled successfully',
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActive(0);
    setSecret('');
    setQrCode('');
    setBackupCodes([]);
    setSavedBackupCodes(false);
    setVerificationCode('');
    setError(null);
    onClose();
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.info({
      title: t('common.success'),
      message: 'Secret copied to clipboard',
    });
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piggypulse-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.info({
      title: t('common.success'),
      message: 'Backup codes downloaded',
    });
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.info({
      title: t('common.success'),
      message: 'Backup codes copied to clipboard',
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Enable Two-Factor Authentication"
      size="lg"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" variant="light">
            {error}
          </Alert>
        )}

        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
          {/* Step 1: Scan QR Code */}
          <Stepper.Step
            label="Scan QR Code"
            description="Use your authenticator app"
            icon={<IconQrcode size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text size="sm">
                Scan this QR code with your authenticator app (Google Authenticator, Authy,
                1Password, etc.)
              </Text>

              {qrCode ? (
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper p="md" withBorder>
                    <img src={qrCode} alt="QR Code" width={200} height={200} />
                  </Paper>
                </Box>
              ) : (
                <Box style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader />
                </Box>
              )}

              <Text size="sm" c="dimmed">
                Can't scan the QR code? Enter this secret manually:
              </Text>

              <Group>
                <Code style={{ flex: 1 }}>{secret || 'Loading...'}</Code>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCopy size={16} />}
                  onClick={copySecret}
                  disabled={!secret}
                >
                  Copy
                </Button>
              </Group>

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setActive(1)} disabled={!secret}>
                  Next
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 2: Save Backup Codes */}
          <Stepper.Step
            label="Save Backup Codes"
            description="For account recovery"
            icon={<IconDownload size={18} />}
          >
            <Stack gap="md" mt="md">
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Important"
                color="yellow"
                variant="light"
              >
                Save these backup codes in a secure location. Each code can only be used once to
                access your account if you lose your authenticator device.
              </Alert>

              <Paper p="md" withBorder>
                <Stack gap="xs">
                  {backupCodes.map((code, index) => (
                    <Group key={index} justify="space-between">
                      <Code>{code}</Code>
                      {index === 0 && (
                        <Text size="xs" c="dimmed">
                          ({backupCodes.length} codes total)
                        </Text>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Paper>

              <Group>
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  onClick={downloadBackupCodes}
                  disabled={backupCodes.length === 0}
                >
                  Download
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconCopy size={16} />}
                  onClick={copyBackupCodes}
                  disabled={backupCodes.length === 0}
                >
                  Copy All
                </Button>
              </Group>

              <Checkbox
                label="I have saved my backup codes in a secure location"
                checked={savedBackupCodes}
                onChange={(e) => setSavedBackupCodes(e.currentTarget.checked)}
              />

              <Group justify="space-between" mt="md">
                <Button variant="default" onClick={() => setActive(0)}>
                  Back
                </Button>
                <Button onClick={() => setActive(2)} disabled={!savedBackupCodes}>
                  Next
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 3: Verify */}
          <Stepper.Step
            label="Verify"
            description="Enter 6-digit code"
            icon={<IconCheck size={18} />}
          >
            <Stack gap="md" mt="md">
              <Text size="sm">
                Enter the 6-digit code from your authenticator app to verify setup:
              </Text>

              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <PinInput
                  length={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  placeholder=""
                  type="number"
                  size="lg"
                  disabled={loading}
                />
              </Box>

              <Group justify="space-between" mt="md">
                <Button variant="default" onClick={() => setActive(1)} disabled={loading}>
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  loading={loading}
                  disabled={verificationCode.length !== 6}
                >
                  Verify & Enable
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>
        </Stepper>
      </Stack>
    </Modal>
  );
}
