import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { ActionIcon, Box, Text, useMantineTheme } from '@mantine/core';

interface DayPickerProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function DayPicker({ value, min = 1, max = 28, onChange }: DayPickerProps) {
  const theme = useMantineTheme();

  function increment() {
    onChange(value < max ? value + 1 : min);
  }

  function decrement() {
    onChange(value > min ? value - 1 : max);
  }

  return (
    <Box
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: theme.radius.md,
        border: `1px solid var(--mantine-color-default-border)`,
        overflow: 'hidden',
        width: 72,
      }}
    >
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={increment}
        aria-label="Increase day"
        style={{
          borderRadius: 0,
          borderBottom: `1px solid var(--mantine-color-default-border)`,
          width: '100%',
        }}
      >
        <IconChevronUp size={16} />
      </ActionIcon>

      <Box
        style={{
          padding: '12px 0',
          textAlign: 'center',
          background: 'var(--mantine-color-default)',
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: theme.fontFamilyMonospace,
          }}
        >
          {String(value).padStart(2, '0')}
        </Text>
      </Box>

      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={decrement}
        aria-label="Decrease day"
        style={{
          borderRadius: 0,
          borderTop: `1px solid var(--mantine-color-default-border)`,
          width: '100%',
        }}
      >
        <IconChevronDown size={16} />
      </ActionIcon>
    </Box>
  );
}
