import React from 'react';
import { Card, Group, Paper, rem, Skeleton, Text } from '@mantine/core';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  meta?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    positive: boolean;
  };
  featured?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  trend,
  featured,
  loading,
  onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Skeleton height={20} width="50%" />
          <Skeleton height={30} width={30} radius="md" />
        </Group>
        <Skeleton height={30} width="70%" mb="xs" />
        <Skeleton height={15} width="40%" />
      </Paper>
    );
  }

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: featured ? 'rgba(0, 212, 255, 0.08)' : 'var(--mantine-color-dark-7)',
        borderColor: featured ? 'rgba(0, 212, 255, 0.2)' : 'var(--mantine-color-dark-4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: featured ? '0 0 32px rgba(0, 212, 255, 0.15)' : undefined,
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <div
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 6,
            }}
          >
            <Icon
              style={{ width: rem(14), height: rem(14), fontSize: rem(14), lineHeight: 1 }}
              stroke={1.5}
              color="var(--mantine-color-dimmed)"
            />
          </div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 0.8 }}>
            {label}
          </Text>
        </Group>
      </Group>

      <Group align="flex-end" gap="xs" mb="xs">
        <Text
          fw={700}
          size="xl"
          style={{
            fontSize: rem(28),
            fontFamily: 'var(--mantine-font-family-monospace)',
            lineHeight: 1.2,
            background: featured
              ? 'linear-gradient(135deg, var(--mantine-color-cyan-5) 0%, var(--mantine-color-violet-5) 100%)'
              : undefined,
            WebkitBackgroundClip: featured ? 'text' : undefined,
            WebkitTextFillColor: featured ? 'transparent' : undefined,
          }}
        >
          {value}
        </Text>
      </Group>

      {(trend || meta) && (
        <Group gap="xs">
          {trend && (
            <Group gap={2}>
              {trend.direction === 'up' ? (
                <span
                  style={{
                    fontSize: 14,
                    color: trend.positive
                      ? 'var(--mantine-color-green-5)'
                      : 'var(--mantine-color-red-5)',
                  }}
                >
                  ↗️
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    color: trend.positive
                      ? 'var(--mantine-color-green-5)'
                      : 'var(--mantine-color-red-5)',
                  }}
                >
                  ↘️
                </span>
              )}
              <Text
                size="xs"
                fw={600}
                c={trend.positive ? 'green.5' : 'red.5'}
                style={{
                  backgroundColor: trend.positive
                    ? 'rgba(0, 255, 163, 0.1)'
                    : 'rgba(255, 107, 157, 0.1)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {trend.value}
              </Text>
            </Group>
          )}
          {trend && meta && (
            <Text size="xs" c="dimmed">
              •
            </Text>
          )}
          {meta && (
            <Text size="sm" c="dimmed">
              {meta}
            </Text>
          )}
        </Group>
      )}
    </Card>
  );
}
