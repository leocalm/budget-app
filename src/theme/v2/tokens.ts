/**
 * V2 Design Tokens
 *
 * 4 color themes × 2 modes (dark/light).
 * Surface colors are shared across all themes; only accent/data colors change per theme.
 */

// ---------------------------------------------------------------------------
// Surfaces — shared across all 4 themes
// ---------------------------------------------------------------------------

export const surfaces = {
  dark: {
    background: '#0D0C14',
    card: '#161520',
    elevated: '#1E1D2B',
    border: '#28263A',
  },
  light: {
    background: '#F5F4FA',
    card: '#E4E1EE',
    elevated: '#EDEBF4',
    border: '#DBD8E6',
  },
} as const;

// ---------------------------------------------------------------------------
// Shared colors
// ---------------------------------------------------------------------------

export const shared = {
  /** Primary across all themes */
  lavender: '#8B7EC8',
  /** Destructive / danger actions */
  destructive: '#C4786A',
} as const;

// ---------------------------------------------------------------------------
// Per-theme accent + data colors
// ---------------------------------------------------------------------------

export type ColorTheme =
  | 'nebula'
  | 'sunrise'
  | 'sage_stone'
  | 'deep_ocean'
  | 'warm_rose'
  | 'moonlit';

export const DEFAULT_COLOR_THEME: ColorTheme = 'nebula';

interface ThemeAccents {
  /** Display name */
  label: string;
  /** Short description */
  description: string;
  /** Primary accent — always lavender */
  primary: string;
  /** Secondary accent — varies per theme */
  secondary: string;
  /** Tertiary accent */
  tertiary: string;
  /** Optional fourth accent */
  quaternary?: string;
  /** Destructive color */
  destructive: string;
  /** Brand gradient (left → right) */
  gradient: [string, string];
  /**
   * Extended data palette for charts/visualizations (~8 colors).
   * First 3-4 are the theme accents; rest are generated tints.
   */
  data: string[];
}

/** Generate lighter/darker tints from a hex color */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function tint(hex: string, lightnessOffset: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, Math.max(0, l + lightnessOffset)));
}

function buildDataPalette(accents: string[]): string[] {
  // Start with the theme accents, then add lighter tints to reach ~8 colors
  const palette = [...accents];
  const targetCount = 8;
  let idx = 0;
  while (palette.length < targetCount) {
    palette.push(tint(accents[idx % accents.length], 15 + idx * 5));
    idx++;
  }
  return palette;
}

export const themes: Record<ColorTheme, ThemeAccents> = {
  nebula: {
    label: 'Nebula',
    description: 'Lavender + Rose',
    primary: shared.lavender,
    secondary: '#C48BA0',
    tertiary: '#7CA8C4',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#C48BA0'],
    data: buildDataPalette([shared.lavender, '#C48BA0', '#7CA8C4']),
  },
  sunrise: {
    label: 'Sunrise',
    description: 'Blue + Amber',
    primary: '#4A7CFF',
    secondary: '#F0A25C',
    tertiary: '#9B8AE0',
    destructive: shared.destructive,
    gradient: ['#4A7CFF', '#F0A25C'],
    data: buildDataPalette(['#4A7CFF', '#F0A25C', '#9B8AE0']),
  },
  sage_stone: {
    label: 'Sage & Stone',
    description: 'Green + Sandstone',
    primary: '#6B8F71',
    secondary: '#B89F7E',
    tertiary: '#7A9EBA',
    destructive: shared.destructive,
    gradient: ['#6B8F71', '#B89F7E'],
    data: buildDataPalette(['#6B8F71', '#B89F7E', '#7A9EBA']),
  },
  deep_ocean: {
    label: 'Deep Ocean',
    description: 'Teal + Sand',
    primary: '#3D8B9E',
    secondary: '#D4A574',
    tertiary: '#8E7EBD',
    destructive: shared.destructive,
    gradient: ['#3D8B9E', '#D4A574'],
    data: buildDataPalette(['#3D8B9E', '#D4A574', '#8E7EBD']),
  },
  warm_rose: {
    label: 'Warm Rose',
    description: 'Rose + Linen',
    primary: '#B07592',
    secondary: '#C4A882',
    tertiary: '#7C9EB8',
    destructive: shared.destructive,
    gradient: ['#B07592', '#C4A882'],
    data: buildDataPalette(['#B07592', '#C4A882', '#7C9EB8']),
  },
  moonlit: {
    label: 'Moonlit',
    description: 'Lavender + Silver',
    primary: shared.lavender,
    secondary: '#A8B4C4',
    tertiary: '#7AADCF',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#A8B4C4'],
    data: buildDataPalette([shared.lavender, '#A8B4C4', '#7AADCF']),
  },
};

// ---------------------------------------------------------------------------
// Font stacks
// ---------------------------------------------------------------------------

export const fonts = {
  title: "'Calistoga', Georgia, serif",
  body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  mono: "'JetBrains Mono', monospace",
} as const;
