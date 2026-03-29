import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Alert,
  Button,
  Checkbox,
  CopyButton,
  Group,
  Modal,
  PinInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { apiClient } from '@/api/v2client';
import { useEnableTwoFactor } from '@/hooks/v2/useTwoFactor';
import { toast } from '@/lib/toast';

type Step = 'qr' | 'verify' | 'codes';

interface TwoFactorSetupModalProps {
  opened: boolean;
  onClose: () => void;
}

export function TwoFactorSetupModal({ opened, onClose }: TwoFactorSetupModalProps) {
  const enableMutation = useEnableTwoFactor();

  const [step, setStep] = useState<Step>('qr');
  const [secret, setSecret] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);

  const handleStart = async () => {
    try {
      const result = await enableMutation.mutateAsync();
      if (result) {
        setSecret(result.secret);
        setQrCodeUri(result.qrCodeUri);
      }
    } catch {
      toast.error({ message: 'Failed to start 2FA setup' });
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      return;
    }
    setVerifying(true);
    try {
      // For setup verification (authenticated), send just the code
      // The backend accepts { code } without twoFactorToken when authenticated
      const { data, error } = await apiClient.POST('/auth/2fa/verify', {
        body: { twoFactorToken: '', code },
      });
      if (error) {
        throw error;
      }
      // After verification, the response may include backup codes
      // or we need to fetch them separately
      if (data && 'backupCodes' in data) {
        setBackupCodes(data.backupCodes as string[]);
      }
      setStep('codes');
      toast.success({ message: 'Two-factor authentication enabled' });
    } catch {
      toast.error({ message: 'Invalid code. Please try again.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDone = () => {
    setStep('qr');
    setSecret('');
    setQrCodeUri('');
    setCode('');
    setBackupCodes([]);
    setSavedCodes(false);
    onClose();
  };

  // Auto-start on open
  if (opened && !secret && !enableMutation.isPending) {
    handleStart();
  }

  const codesText = backupCodes.join('\n');

  return (
    <Modal
      opened={opened}
      onClose={step === 'codes' ? handleDone : onClose}
      title={step === 'codes' ? 'Save your recovery codes' : 'Set up two-factor authentication'}
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      {/* Step 1: QR Code */}
      {step === 'qr' && (
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft
            Authenticator, etc.)
          </Text>

          {qrCodeUri && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--mantine-spacing-md)',
              }}
            >
              <QRCodeSVG value={qrCodeUri} size={200} />
            </div>
          )}

          {secret && (
            <>
              <Text fz="xs" c="dimmed">
                Can&apos;t scan? Enter this code manually:
              </Text>
              <Group gap="xs">
                <TextInput
                  value={secret}
                  readOnly
                  ff="var(--mantine-font-family-monospace)"
                  style={{ flex: 1 }}
                  size="sm"
                />
                <CopyButton value={secret}>
                  {({ copied, copy }) => (
                    <Button size="sm" variant="subtle" onClick={copy}>
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </>
          )}

          <Button onClick={() => setStep('verify')} fullWidth disabled={!secret}>
            Next
          </Button>
        </Stack>
      )}

      {/* Step 2: Verify code */}
      {step === 'verify' && (
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            Enter the 6-digit code from your authenticator app to confirm setup.
          </Text>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PinInput
              length={6}
              type="number"
              size="lg"
              value={code}
              onChange={setCode}
              oneTimeCode
              autoFocus
            />
          </div>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setStep('qr')}>
              Back
            </Button>
            <Button onClick={handleVerify} loading={verifying} disabled={code.length < 6}>
              Verify &amp; Enable 2FA
            </Button>
          </Group>
        </Stack>
      )}

      {/* Step 3: Recovery codes */}
      {step === 'codes' && (
        <Stack gap="md">
          <Alert variant="light" color="orange">
            Save these recovery codes in a safe place. They are your backup if you lose access to
            your authenticator app.
          </Alert>

          {backupCodes.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--mantine-spacing-xs)',
                padding: 'var(--mantine-spacing-md)',
                border: '1px solid var(--v2-border)',
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: 'var(--v2-elevated)',
              }}
            >
              {backupCodes.map((c) => (
                <Text key={c} fz="sm" ff="var(--mantine-font-family-monospace)">
                  {c}
                </Text>
              ))}
            </div>
          ) : (
            <Text fz="sm" c="dimmed" ta="center">
              No recovery codes returned. You can generate them from settings.
            </Text>
          )}

          {backupCodes.length > 0 && (
            <Group>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  const blob = new Blob([codesText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'piggypulse-recovery-codes.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </Button>
              <CopyButton value={codesText}>
                {({ copied, copy }) => (
                  <Button variant="subtle" size="sm" onClick={copy}>
                    {copied ? 'Copied' : 'Copy All'}
                  </Button>
                )}
              </CopyButton>
            </Group>
          )}

          <Checkbox
            label="I have saved my recovery codes"
            checked={savedCodes}
            onChange={(e) => setSavedCodes(e.currentTarget.checked)}
          />

          <Button onClick={handleDone} fullWidth disabled={!savedCodes}>
            Done
          </Button>
        </Stack>
      )}
    </Modal>
  );
}
