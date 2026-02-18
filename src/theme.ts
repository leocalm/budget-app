import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  colors: {
    dark: [
      '#C1C2C5', // 0
      '#A6A7AB', // 1
      '#909296', // 2
      '#5C5F66', // 3
      '#373A40', // 4
      '#2A2F38', // 5
      '#242934', // 6
      '#1C1F26', // 7
      '#181B21', // 8
      '#14161A', // 9
    ],
    light: [
      '#1A1D21', // 0
      '#303745', // 1
      '#5C6470', // 2
      '#8B93A1', // 3
      '#E6E8F0', // 4
      '#FAFBFF', // 5
      '#FFFFFF', // 6
      '#FFFFFF', // 7
      '#F7F8FC', // 8
      '#F4F6FB', // 9
    ],
    piggyPrimary: [
      '#ECECFF',
      '#D8D9FF',
      '#B4B7FF',
      '#9094FF',
      '#7378F3',
      '#5E63E6',
      '#4A4FC2',
      '#373A99',
      '#23255F',
      '#141634',
    ],
    piggySecondary: [
      '#F3EDFF',
      '#E5D8FF',
      '#D0BAFF',
      '#B99AFD',
      '#A37CF8',
      '#8C6CFB',
      '#7358D4',
      '#5A43A8',
      '#3C2C6F',
      '#23183F',
    ],
    cyan: [
      '#E3FAFC',
      '#C5F6FA',
      '#99E9F2',
      '#66D9E8',
      '#3BC9DB',
      '#22B8CF',
      '#15AABF',
      '#1098AD',
      '#0C8599',
      '#0B7285',
    ],
    orange: [
      '#fff0e0',
      '#ffe2b3',
      '#ffd380',
      '#ffc44d',
      '#ffb51a',
      '#ffa940',
      '#cc8733',
      '#996526',
      '#664419',
      '#33220d',
    ],
    pink: [
      '#ffe0ea',
      '#ffb3cc',
      '#ff80ad',
      '#ff4d8f',
      '#ff1a70',
      '#ff6b9d',
      '#cc567e',
      '#99405e',
      '#662b3f',
      '#33151f',
    ],
    violet: [
      '#f2e0ff',
      '#dfb3ff',
      '#cc80ff',
      '#b94dff',
      '#a61aff',
      '#b47aff',
      '#9062cc',
      '#6c4999',
      '#483166',
      '#241833',
    ],
  },
  primaryColor: 'piggyPrimary',
  primaryShade: 5,
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Sora, Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  fontFamilyMonospace: "'JetBrains Mono', monospace",
  radius: {
    xs: rem(4),
    sm: rem(8),
    md: rem(14),
    lg: rem(16),
    xl: rem(20),
  },
  spacing: {
    xs: rem(6),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
    xxl: rem(32),
    xxxl: rem(40),
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.24)',
    glow: '0 0 24px rgba(94, 99, 230, 0.16)',
  },
  components: {
    Container: {
      defaultProps: {
        size: 1100,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-soft)',
          borderWidth: rem(1),
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 600,
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-soft)',
          borderWidth: rem(1),
        },
      },
    },
  },
  other: {
    brandGradient: 'linear-gradient(90deg, #5E63E6 0%, #8C6CFB 100%)',
    colors: {
      background: {
        primary: '#14161A',
        secondary: '#1C1F26',
        tertiary: '#242934',
        card: '#1C1F26',
        elevated: '#242934',
      },
    },
  },
});
