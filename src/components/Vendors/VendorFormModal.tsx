import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Drawer, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { useCreateVendor, useUpdateVendor } from '@/hooks/useVendors';
import { VendorWithStats } from '@/types/vendor';

interface VendorFormModalProps {
  opened: boolean;
  onClose: () => void;
  vendor?: VendorWithStats | null;
}

export function VendorFormModal({ opened, onClose, vendor }: VendorFormModalProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 48em)');
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => {
        if (!value || value.trim().length === 0) {
          return t('vendors.errors.nameRequired');
        }
        if (value.trim().length < 2) {
          return t('vendors.errors.nameMinLength');
        }
        if (value.trim().length > 100) {
          return t('vendors.errors.nameMaxLength');
        }
        return null;
      },
    },
  });

  // Update form when vendor changes
  useEffect(() => {
    if (vendor) {
      form.setValues({
        name: vendor.name,
      });
    } else {
      form.reset();
    }
  }, [vendor, opened]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (vendor?.id) {
        // Update existing vendor
        await updateMutation.mutateAsync({
          id: vendor.id,
          data: { name: values.name.trim() },
        });
      } else {
        // Create new vendor
        await createMutation.mutateAsync({ name: values.name.trim() });
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error is handled by React Query
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const title = vendor ? t('vendors.editVendor') : t('vendors.addVendor');

  const formContent = (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label={t('vendors.form.nameLabel')}
          placeholder={t('vendors.form.namePlaceholder')}
          required
          {...form.getInputProps('name')}
          disabled={isLoading}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
            {t('vendors.form.cancelButton')}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t('vendors.form.saveButton')}
          </Button>
        </Group>
      </Stack>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer opened={opened} onClose={handleClose} position="bottom" title={title} size="auto">
        {formContent}
      </Drawer>
    );
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={title} centered>
      {formContent}
    </Modal>
  );
}
