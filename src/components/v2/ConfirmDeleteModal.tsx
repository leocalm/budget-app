import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  entityName,
  loading = false,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation('v2');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('common.deleteConfirmTitle')}
      size="sm"
      centered
    >
      <Stack gap="md">
        <Text fz="sm">{t('common.deleteConfirmMessage', { name: entityName })}</Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
