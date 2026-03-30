import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useMergeVendor, useVendorsOptions } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

interface MergeVendorModalProps {
  opened: boolean;
  onClose: () => void;
  sourceVendorId: string;
  sourceVendorName: string;
}

export function MergeVendorModal({
  opened,
  onClose,
  sourceVendorId,
  sourceVendorName,
}: MergeVendorModalProps) {
  const { t } = useTranslation('v2');
  const { data: options } = useVendorsOptions();
  const mergeMutation = useMergeVendor();
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setTargetId(null);
    }
  }, [opened]);

  const vendorOptions = (options ?? [])
    .filter((v) => v.id !== sourceVendorId)
    .map((v) => ({ value: v.id, label: v.name }));

  const handleMerge = async () => {
    if (!targetId) {
      return;
    }

    try {
      await mergeMutation.mutateAsync({ id: sourceVendorId, targetVendorId: targetId });
      toast.success({ message: t('vendors.merge.success', { name: sourceVendorName }) });
      onClose();
    } catch {
      toast.error({ message: t('vendors.merge.failed') });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('vendors.merge.title')}
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          {t('vendors.merge.description', { name: sourceVendorName })}
        </Text>

        <Text fz="sm" fw={600}>
          {t('vendors.merge.source', { name: sourceVendorName })}
        </Text>

        <Select
          label={t('vendors.merge.mergeInto')}
          placeholder={t('vendors.merge.selectTarget')}
          data={vendorOptions}
          value={targetId}
          onChange={setTargetId}
          searchable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={mergeMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            color="red"
            onClick={handleMerge}
            loading={mergeMutation.isPending}
            disabled={!targetId}
          >
            {t('vendors.merge.mergeAndDelete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
