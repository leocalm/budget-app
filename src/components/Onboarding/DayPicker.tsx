import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Box, Text, UnstyledButton, useMantineTheme } from '@mantine/core';

interface DayPickerProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function DayPicker({ value, min = 1, max = 28, onChange }: DayPickerProps) {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][4];
  const primaryHover = theme.colors[theme.primaryColor][5];

  function increment() {
    onChange(value < max ? value + 1 : min);
  }

  function decrement() {
    onChange(value > min ? value - 1 : max);
  }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    width: '100%',
    background: primary,
    color: theme.white,
    cursor: 'pointer',
    border: 'none',
    transition: 'background 120ms ease',
  };

  return (
    <Box
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: theme.radius.md,
        border: `1px solid ${primary}`,
        overflow: 'hidden',
        width: 100,
      }}
    >
      <UnstyledButton
        onClick={increment}
        aria-label="Increase day"
        style={btnBase}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primaryHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primary;
        }}
      >
        <IconChevronUp size={14} />
      </UnstyledButton>

      <Box
        style={{
          padding: '12px 0',
          textAlign: 'center',
          background: 'var(--mantine-color-default)',
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: theme.fontFamilyMonospace,
          }}
        >
          {String(value).padStart(2, '0')}
        </Text>
      </Box>

      <UnstyledButton
        onClick={decrement}
        aria-label="Decrease day"
        style={btnBase}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primaryHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = primary;
        }}
      >
        <IconChevronDown size={14} />
      </UnstyledButton>
    </Box>
  );
}
