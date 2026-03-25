import { createTheme } from '@mantine/core';
import { fonts } from './tokens';

/**
 * Mantine v8 theme override for v2 redesign.
 *
 * Color-specific tokens are applied via CSS custom properties by V2ThemeProvider,
 * so this theme focuses on typography, spacing, and component defaults.
 */
export const v2MantineTheme = createTheme({
  fontFamily: fonts.body,
  fontFamilyMonospace: fonts.mono,
  headings: {
    fontFamily: fonts.title,
  },

  // Slightly larger default radius for the warm/boutique feel
  defaultRadius: 'md',

  // Primary color — lavender. We define a 10-shade palette so Mantine components
  // (buttons, focus rings, etc.) use lavender automatically.
  primaryColor: 'lavender',
  colors: {
    lavender: [
      '#f3f1fc', // 0 - lightest
      '#e4e0f6', // 1
      '#c9c1ed', // 2
      '#ada1e3', // 3
      '#9b8fd6', // 4
      '#8B7EC8', // 5 - primary (base)
      '#7a6eb5', // 6
      '#695ea2', // 7
      '#584e8f', // 8
      '#473e7c', // 9 - darkest
    ],
    destructive: [
      '#fdf2f0', // 0
      '#f8ddd8', // 1
      '#efc0b7', // 2
      '#e3a295', // 3
      '#d48d7f', // 4
      '#C4786A', // 5 - base
      '#b16a5e', // 6
      '#9d5c52', // 7
      '#8a4e46', // 8
      '#77403a', // 9
    ],
  },

  other: {
    // Expose font stacks so components can reference them if needed
    fontTitle: fonts.title,
    fontMono: fonts.mono,
  },
});
