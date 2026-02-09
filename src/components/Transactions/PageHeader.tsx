import React from 'react';
import { Box, Text, Title } from '@mantine/core';
import { PeriodHeaderControl } from '@/components/BudgetPeriodSelector';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <Box
      style={{
        marginBottom: '48px',
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '24px',
        }}
        className="header-top"
      >
        <Box>
          <Title
            order={1}
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              style={{
                fontSize: '15px',
                color: '#8892a6',
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'flex-end',
            marginLeft: 'auto',
          }}
        >
          <PeriodHeaderControl />
          {actions}
        </Box>
      </Box>
    </Box>
  );
};
