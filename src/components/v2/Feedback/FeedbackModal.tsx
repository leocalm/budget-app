import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useMe } from '@/hooks/v2/useAuth';
import { Sentry } from '@/lib/sentry';
import { toast } from '@/lib/toast';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
}

export function FeedbackModal({ opened, onClose }: FeedbackModalProps) {
  const { t } = useTranslation('v2');
  const { data: user } = useMe();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      setMessage('');
    }
  }, [opened, user?.name, user?.email]);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    setSubmitting(true);
    try {
      Sentry.captureFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: trimmed,
      });
      toast.success({ message: t('feedback.success') });
      onClose();
    } catch {
      toast.error({ message: t('feedback.error') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('feedback.title')}
      centered
      size="md"
      data-testid="feedback-modal"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('feedback.subtitle')}
        </Text>
        <TextInput
          label={t('feedback.nameLabel')}
          placeholder={t('feedback.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          autoComplete="name"
        />
        <TextInput
          label={t('feedback.emailLabel')}
          placeholder={t('feedback.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          type="email"
          autoComplete="email"
        />
        <Textarea
          label={t('feedback.messageLabel')}
          placeholder={t('feedback.messagePlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          minRows={5}
          autosize
          required
          data-testid="feedback-message"
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!message.trim()}
            data-testid="feedback-submit"
          >
            {t('feedback.submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
