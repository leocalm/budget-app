import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  colors: {
    // Custom dark palette based on spec
    // 9: primary bg, 8: secondary bg, 7: card bg, 6: tertiary bg, 5: elevated bg
    dark: [
      '#C1C2C5', // 0
      '#A6A7AB', // 1
      '#909296', // 2
      '#5C5F66', // 3
      '#373A40', // 4
      '#1e2433', // 5 - elevated
      '#1a1f2e', // 6 - tertiary
      '#151b26', // 7 - card
      '#121720', // 8 - secondary
      '#0a0e14', // 9 - primary
    ],
    // Accents (Index 5 matches the spec hex codes)
    cyan: [
      '#e0fbff',
      '#b3f2ff',
      '#80eaff',
      '#4de1ff',
      '#1ad9ff',
      '#00d4ff',
      '#00aacc',
      '#008099',
      '#005566',
      '#002b33',
    ],
    green: [
      '#e0ffed',
      '#b3ffdb',
      '#80ffc8',
      '#4dffb6',
      '#1affa4',
      '#00ffa3',
      '#00cc82',
      '#009962',
      '#006641',
      '#003321',
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
  primaryColor: 'cyan',
  primaryShade: 5,
  fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', monospace",
  headings: {
    fontFamily: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: '700',
  },
  radius: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
    xxl: rem(48),
    xxxl: rem(64),
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.24)',
    glow: '0 0 32px rgba(0, 212, 255, 0.15)',
  },
  other: {
    colors: {
      background: {
        primary: '#0a0e14',
        secondary: '#121720',
        tertiary: '#1a1f2e',
        card: '#151b26',
        elevated: '#1e2433',
      },
    },
  },
});
