import { useNavigate } from 'react-router-dom';
import { ActionIcon, Menu, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import classes from './Vendors.module.css';

type VendorSummary = components['schemas']['VendorSummaryResponse'];

interface VendorRowProps {
  vendor: VendorSummary;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onMerge: (id: string) => void;
}

export function VendorRow({
  vendor,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onMerge,
}: VendorRowProps) {
  const navigate = useNavigate();
  const isArchived = vendor.status === 'inactive';
  const initial = vendor.name.charAt(0).toUpperCase();

  return (
    <div
      className={isArchived ? classes.vendorRowArchived : classes.vendorRow}
      onClick={() => navigate(`/v2/vendors/${vendor.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/v2/vendors/${vendor.id}`);
        }
      }}
    >
      {/* Initial badge */}
      <div className={classes.initialBadge}>
        <Text fz="sm" fw={700} c="dimmed">
          {initial}
        </Text>
      </div>

      {/* Name + meta */}
      <div className={classes.vendorInfo}>
        <Text fz="md" fw={600} truncate>
          {vendor.name}
        </Text>
        <Text fz="xs" c="dimmed">
          {vendor.numberOfTransactions} txns
          {isArchived && ' · Archived'}
        </Text>
      </div>

      {/* Stats */}
      {!isArchived && (
        <div className={classes.vendorStats}>
          <div className={classes.vendorStat}>
            <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
              <CurrencyValue cents={vendor.totalSpend} />
            </Text>
          </div>
        </div>
      )}

      {/* Kebab */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={classes.kebabCell} onClick={(e) => e.stopPropagation()}>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`Actions for ${vendor.name}`}
            >
              <Text fz="lg" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {!isArchived && <Menu.Item onClick={() => onEdit(vendor.id)}>Edit</Menu.Item>}
            {!isArchived && <Menu.Item onClick={() => onMerge(vendor.id)}>Merge</Menu.Item>}
            {isArchived ? (
              <Menu.Item onClick={() => onUnarchive(vendor.id)}>Unarchive</Menu.Item>
            ) : (
              <Menu.Item onClick={() => onArchive(vendor.id)}>Archive</Menu.Item>
            )}
            <Menu.Item color="red" onClick={() => onDelete(vendor.id)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
