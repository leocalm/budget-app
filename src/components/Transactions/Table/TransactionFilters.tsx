import React, { useState } from 'react';
import { Box, Group, Text, UnstyledButton } from '@mantine/core';

export type TransactionTypeFilter = 'all' | 'Incoming' | 'Outgoing' | 'Transfer';

interface TransactionFiltersProps {
  typeFilter: TransactionTypeFilter;
  onTypeFilterChange: (value: TransactionTypeFilter) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

interface FilterTab {
  label: string;
  value: TransactionTypeFilter;
}

interface QuickFilter {
  icon: string;
  label: string;
  id: string;
}

const filterTabs: FilterTab[] = [
  { label: 'All Transactions', value: 'all' },
  { label: 'Incoming', value: 'Incoming' },
  { label: 'Outgoing', value: 'Outgoing' },
  { label: 'Transfers', value: 'Transfer' },
];

const quickFilters: QuickFilter[] = [
  { icon: '📅', label: 'Date Range', id: 'date' },
  { icon: '🏦', label: 'Account: All', id: 'account' },
  { icon: '🏷️', label: 'Category: All', id: 'category' },
  { icon: '💰', label: 'Amount: All', id: 'amount' },
];

export function TransactionFilters({ typeFilter, onTypeFilterChange }: TransactionFiltersProps) {
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const toggleQuickFilter = (id: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <Box
      style={{
        background: '#151b26',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '32px',
      }}
    >
      {/* Filter Tabs */}
      <Group
        gap="sm"
        style={{
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '16px',
        }}
      >
        {filterTabs.map((tab) => (
          <UnstyledButton
            key={tab.value}
            onClick={() => onTypeFilterChange(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: typeFilter === tab.value ? '#00d4ff' : '#8892a6',
              background: typeFilter === tab.value ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (typeFilter !== tab.value) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (typeFilter !== tab.value) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#8892a6';
              }
            }}
          >
            {tab.label}
          </UnstyledButton>
        ))}
      </Group>

      {/* Quick Filters */}
      <Group gap="md" wrap="wrap">
        {quickFilters.map((filter) => {
          const isActive = activeQuickFilters.includes(filter.id);
          return (
            <UnstyledButton
              key={filter.id}
              onClick={() => toggleQuickFilter(filter.id)}
              style={{
                padding: '8px 16px',
                background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: isActive ? '#00d4ff' : '#8892a6',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#00d4ff';
                  e.currentTarget.style.color = '#00d4ff';
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#8892a6';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
            >
              <Text component="span">{filter.icon}</Text>
              <Text component="span" style={{ fontSize: '13px' }}>
                {filter.label}
              </Text>
            </UnstyledButton>
          );
        })}
      </Group>
    </Box>
  );
}
