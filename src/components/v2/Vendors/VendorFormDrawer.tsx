import { useEffect, useState } from 'react';
import { Button, Drawer, Group, Stack, Textarea, TextInput } from '@mantine/core';
import type { components } from '@/api/v2';
import { useCreateVendor, useUpdateVendor } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type VendorResponse = components['schemas']['VendorResponse'];

interface VendorFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editVendor?: VendorResponse | null;
}

export function VendorFormDrawer({ opened, onClose, editVendor }: VendorFormDrawerProps) {
  const isEdit = !!editVendor;
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEdit && editVendor) {
      setName(editVendor.name);
      setDescription(editVendor.description ?? '');
    }
  }, [isEdit, editVendor]);

  const handleSubmit = async () => {
    const body: components['schemas']['CreateVendorRequest'] = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      if (isEdit && editVendor) {
        await updateMutation.mutateAsync({ id: editVendor.id, body });
        toast.success({ message: 'Vendor updated' });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: 'Vendor created' });
      }
      onClose();
    } catch {
      toast.error({ message: `Failed to ${isEdit ? 'update' : 'create'} vendor` });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 3;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Vendor' : 'Add Vendor'}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Vendor Name"
          placeholder="e.g. Whole Foods Market"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          minLength={3}
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          maxLength={500}
          autosize
          minRows={2}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
