import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Group, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { EmptyState, LoadingState } from '@/components/Utils';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useDeleteVendor, useVendors } from '@/hooks/useVendors';
import { VendorWithStats } from '@/types/vendor';
import { PageHeader } from '../Transactions/PageHeader';
import { VendorCard } from './VendorCard';
import { VendorDeleteModal } from './VendorDeleteModal';
import { VendorFormModal } from './VendorFormModal';
import styles from './Vendors.module.css';

type SortOrder = 'name' | 'usage' | 'recent';

export function VendorsContainer() {
  const { t } = useTranslation();
  const { selectedPeriodId } = useBudgetPeriodSelection();
  const { data: vendors, isLoading } = useVendors(selectedPeriodId);
  const deleteMutation = useDeleteVendor();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('name');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{
    transactionCount: number;
    vendorId: string;
  } | null>(null);

  // Filter and sort vendors
  const processedVendors = useMemo(() => {
    if (!vendors) {
      return [];
    }

    // Filter by search term
    const filtered = vendors.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Sort
    const sorted = [...filtered];
    switch (sortOrder) {
      case 'usage':
        sorted.sort((a, b) => b.transactionCount - a.transactionCount);
        break;
      case 'recent':
        sorted.sort((a, b) => {
          if (!a.lastUsedAt) {
            return 1;
          }
          if (!b.lastUsedAt) {
            return -1;
          }
          return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
        });
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [vendors, searchTerm, sortOrder]);

  const handleAdd = () => {
    setSelectedVendor(null);
    setFormModalOpen(true);
  };

  const handleEdit = (vendor: VendorWithStats) => {
    setSelectedVendor(vendor);
    setFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setVendorToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(vendorToDelete);
      setDeleteModalOpen(false);
      setVendorToDelete(null);
      setDeleteError(null);
    } catch (error: any) {
      // Handle 409 conflict error
      if (error.status === 409 || error.response?.status === 409) {
        const errorData = error.response?.data || error;
        setDeleteError({
          transactionCount: errorData.transactionCount || 0,
          vendorId: vendorToDelete,
        });
      } else {
        // Other errors - close modal and show generic error
        setDeleteModalOpen(false);
        setVendorToDelete(null);
      }
    }
  };

  const handleViewTransactions = (vendorId: string) => {
    navigate(`/transactions?vendor=${vendorId}`);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setSelectedVendor(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setVendorToDelete(null);
    setDeleteError(null);
  };

  if (isLoading) {
    return (
      <Box p="xl">
        <LoadingState variant="spinner" text={t('states.loading.default')} />
      </Box>
    );
  }

  // Check if we have search results or no vendors at all
  const hasNoVendors = !vendors || vendors.length === 0;
  const hasNoSearchResults = searchTerm && processedVendors.length === 0;

  return (
    <Box
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}
    >
      <Stack gap="xl">
        {/* Header */}
        <PageHeader
          title={t('vendors.title')}
          subtitle={t('vendors.subtitle')}
          actions={
            <Button className={styles.addButton} size="md" onClick={handleAdd}>
              <span style={{ fontSize: '16px', marginRight: '4px' }}>+</span>
              {t('vendors.addVendor')}
            </Button>
          }
        />

        {/* Search and Sort Controls */}
        <Group gap="md">
          <TextInput
            placeholder={t('vendors.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1 }}
            leftSection={<span>🔍</span>}
          />
          <Group gap="xs">
            <Button
              variant={sortOrder === 'name' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSortOrder('name')}
            >
              {t('vendors.sortByName')}
            </Button>
            <Button
              variant={sortOrder === 'usage' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSortOrder('usage')}
            >
              {t('vendors.sortByUsage')}
            </Button>
            <Button
              variant={sortOrder === 'recent' ? 'filled' : 'light'}
              size="sm"
              onClick={() => setSortOrder('recent')}
            >
              {t('vendors.sortByRecent')}
            </Button>
          </Group>
        </Group>

        {/* Vendors Grid or Empty State */}
        {hasNoVendors ? (
          <EmptyState
            icon="🏪"
            title={t('states.empty.vendors.title')}
            message={t('states.empty.vendors.message')}
            primaryAction={{
              label: t('states.empty.vendors.addVendor'),
              icon: <span>+</span>,
              onClick: handleAdd,
            }}
          />
        ) : hasNoSearchResults ? (
          <EmptyState
            variant="search"
            icon="🔍"
            title={t('states.empty.search.title')}
            searchQuery={searchTerm}
            primaryAction={{
              label: t('states.empty.filter.clearAll'),
              icon: <span>🔄</span>,
              onClick: () => setSearchTerm(''),
            }}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
            {processedVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewTransactions={handleViewTransactions}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Form Modal */}
      <VendorFormModal
        opened={formModalOpen}
        onClose={handleCloseFormModal}
        vendor={selectedVendor}
      />

      {/* Delete Modal */}
      <VendorDeleteModal
        opened={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        vendorId={vendorToDelete}
        error={deleteError}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
