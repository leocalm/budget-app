import { useEffect, useState } from 'react';
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
      toast.success({ message: `Merged "${sourceVendorName}" into target vendor` });
      onClose();
    } catch {
      toast.error({ message: 'Failed to merge vendor' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Merge Vendor"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          All transactions from &ldquo;{sourceVendorName}&rdquo; will be transferred to the target
          vendor. The source vendor will be deleted.
        </Text>

        <Text fz="sm" fw={600}>
          Source: {sourceVendorName}
        </Text>

        <Select
          label="Merge into"
          placeholder="Select target vendor..."
          data={vendorOptions}
          value={targetId}
          onChange={setTargetId}
          searchable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={mergeMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleMerge}
            loading={mergeMutation.isPending}
            disabled={!targetId}
          >
            Merge &amp; Delete Source
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
