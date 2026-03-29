import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Alert,
  Button,
  Checkbox,
  CopyButton,
  Group,
  Loader,
  Modal,
  PinInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { apiClient } from '@/api/v2client';
import { useEnableTwoFactor, useRegenerateBackupCodes } from '@/hooks/v2/useTwoFactor';
import { toast } from '@/lib/toast';

type Step = 'loading' | 'qr' | 'verify' | 'codes';

interface TwoFactorSetupModalProps {
  opened: boolean;
  onClose: () => void;
}

export function TwoFactorSetupModal({ opened, onClose }: TwoFactorSetupModalProps) {
  const enableMutation = useEnableTwoFactor();
  const regenerateCodesMutation = useRegenerateBackupCodes();

  const [step, setStep] = useState<Step>('loading');
  const [secret, setSecret] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);
  const started = useRef(false);

  // Start setup when modal opens
  useEffect(() => {
    if (!opened) {
      // Reset state when modal closes
      started.current = false;
      setStep('loading');
      setSecret('');
      setQrCodeUri('');
      setCode('');
      setBackupCodes([]);
      setSavedCodes(false);
      return;
    }

    if (started.current) {
      return;
    }
    started.current = true;

    enableMutation
      .mutateAsync()
      .then((result) => {
        if (result) {
          setSecret(result.secret);
          setQrCodeUri(result.qrCodeUri);
          setStep('qr');
        }
      })
      .catch(() => {
        toast.error({ message: 'Failed to start 2FA setup' });
        onClose();
      });
  }, [opened]); // Only re-run when opened changes; mutations are stable refs

  const handleVerify = async () => {
    if (code.length < 6) {
      return;
    }
    setVerifying(true);
    try {
      // Setup verification — authenticated, the backend accepts the code
      // to activate 2FA, then we regenerate backup codes with the same code
      const { error } = await apiClient.POST('/auth/2fa/verify', {
        body: { twoFactorToken: '', code } as never,
      });
      if (error) {
        throw error;
      }

      // Now generate backup codes using the same TOTP code
      try {
        const codes = await regenerateCodesMutation.mutateAsync({ code });
        if (codes) {
          setBackupCodes(codes);
        }
      } catch {
        // 2FA is enabled but codes failed — user can regenerate from settings
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
    onClose();
  };

  const codesText = backupCodes.join('\n');

  const handleDownload = () => {
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piggypulse-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      opened={opened}
      onClose={step === 'codes' ? handleDone : onClose}
      title={step === 'codes' ? 'Save your recovery codes' : 'Set up two-factor authentication'}
      size="md"
      closeOnClickOutside={step !== 'codes'}
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      {/* Loading */}
      {step === 'loading' && (
        <Stack gap="md" align="center" py="xl">
          <Loader size="md" />
          <Text fz="sm" c="dimmed">
            Preparing 2FA setup...
          </Text>
        </Stack>
      )}

      {/* Step 1: QR Code */}
      {step === 'qr' && (
        <Stack gap="md">
          <Text fz="sm" c="dimmed">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft
            Authenticator, etc.)
          </Text>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--mantine-spacing-md)',
            }}
          >
            <QRCodeSVG value={qrCodeUri} size={200} />
          </div>

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

          <Button onClick={() => setStep('verify')} fullWidth>
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
              {backupCodes.map((c, i) => (
                <Text key={i} fz="sm" ff="var(--mantine-font-family-monospace)">
                  {c}
                </Text>
              ))}
            </div>
          ) : (
            <Text fz="sm" c="dimmed" ta="center">
              Recovery codes could not be generated. You can regenerate them from settings.
            </Text>
          )}

          {backupCodes.length > 0 && (
            <Group>
              <Button variant="subtle" size="sm" onClick={handleDownload}>
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

          <Button onClick={handleDone} fullWidth disabled={!savedCodes && backupCodes.length > 0}>
            Done
          </Button>
        </Stack>
      )}
    </Modal>
  );
}
