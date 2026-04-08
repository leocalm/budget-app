import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('v2');
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
        toast.success({ message: t('vendors.updated') });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: t('vendors.created') });
      }
      onClose();
    } catch {
      toast.error({ message: t('vendors.saveFailed', { action: isEdit ? 'update' : 'create' }) });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 3;

  return (
    <Drawer
      data-testid="vendor-form-drawer"
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('vendors.form.editTitle') : t('vendors.form.createTitle')}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <TextInput
          data-testid="vendor-name-input"
          label={t('vendors.form.vendorName')}
          placeholder={t('vendors.form.vendorNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          minLength={3}
        />

        <Textarea
          label={t('vendors.form.description')}
          placeholder={t('vendors.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          maxLength={500}
          autosize
          minRows={2}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            data-testid="vendor-form-submit"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isValid}
          >
            {isEdit ? t('common.saveChanges') : t('vendors.form.createButton')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
