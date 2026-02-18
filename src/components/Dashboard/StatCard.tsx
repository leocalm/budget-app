import React from 'react';
import { Card, Group, Paper, rem, Skeleton, Text, useMantineColorScheme } from '@mantine/core';

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
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const trendColor =
    trend?.direction === 'up' ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)';
  const trendBg =
    trend?.direction === 'up'
      ? 'var(--mantine-color-green-light)'
      : 'var(--mantine-color-red-light)';

  if (loading) {
    return (
      <Paper
        p="lg"
        radius="lg"
        withBorder
        style={{
          background: featured
            ? isDark
              ? 'linear-gradient(135deg, var(--color-accent-primary-soft-strong) 0%, var(--color-accent-secondary-soft) 100%)'
              : 'linear-gradient(135deg, var(--color-accent-primary-soft) 0%, var(--color-accent-secondary-soft) 100%)'
            : 'var(--bg-card)',
          borderColor: featured ? 'var(--accent-primary)' : 'var(--border-soft)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {featured && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background:
                'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            }}
          />
        )}
        <Group justify="space-between" mb="xs" style={featured ? { paddingTop: '8px' } : {}}>
          <Skeleton height={20} width="50%" />
          <Skeleton height={30} width={30} radius="md" />
        </Group>
        <Skeleton height={featured ? 50 : 30} width="70%" mb="xs" />
        <Skeleton height={15} width="40%" />
      </Paper>
    );
  }

  return (
    <Card
      padding="lg"
      radius="lg"
      withBorder
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: featured
          ? isDark
            ? 'linear-gradient(135deg, var(--color-accent-primary-soft-strong) 0%, var(--color-accent-secondary-soft) 100%)'
            : 'linear-gradient(135deg, var(--color-accent-primary-soft) 0%, var(--color-accent-secondary-soft) 100%)'
          : 'var(--bg-card)',
        borderColor: featured ? 'var(--accent-primary)' : 'var(--border-soft)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: featured ? 'var(--shadow-reflective-glow)' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar for featured cards */}
      {featured && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          }}
        />
      )}
      <Group justify="space-between" mb="xs" style={featured ? { paddingTop: '8px' } : {}}>
        <Group gap="xs">
          <div
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-elevated)',
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
          style={{
            fontSize: featured
              ? 'var(--type-reflective-hero-size)'
              : 'var(--type-reflective-secondary-size)',
            fontFamily: 'var(--mantine-font-family-monospace)',
            lineHeight: 1.2,
            color: featured ? undefined : 'var(--text-primary)',
            background: featured
              ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              : undefined,
            WebkitBackgroundClip: featured ? 'text' : undefined,
            WebkitTextFillColor: featured ? 'transparent' : undefined,
            backgroundClip: featured ? 'text' : undefined,
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
                    color: trendColor,
                  }}
                >
                  ↗️
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    color: trendColor,
                  }}
                >
                  ↘️
                </span>
              )}
              <Text
                size="xs"
                fw={600}
                c={trendColor}
                style={{
                  backgroundColor: trendBg,
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
