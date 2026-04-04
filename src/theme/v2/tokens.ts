/**
 * V2 Design Tokens
 *
 * 6 color themes × 2 modes (dark/light).
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

export type ColorTheme = 'nebula' | 'sunrise' | 'neon' | 'tropical' | 'candy_pop' | 'moonlit';

export const DEFAULT_COLOR_THEME: ColorTheme = 'nebula';

interface ThemeAccents {
  /** Display name */
  label: string;
  /** Short description */
  description: string;
  /** Primary accent */
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
  neon: {
    label: 'Electric Neon',
    description: 'Cyan + Magenta',
    primary: '#00F0FF',
    secondary: '#FF00E5',
    tertiary: '#B8FF00',
    destructive: shared.destructive,
    gradient: ['#00F0FF', '#FF00E5'],
    data: buildDataPalette(['#00F0FF', '#FF00E5', '#B8FF00']),
  },
  tropical: {
    label: 'Tropical',
    description: 'Coral + Teal',
    primary: '#FF6B6B',
    secondary: '#00CCB3',
    tertiary: '#FFC800',
    destructive: shared.destructive,
    gradient: ['#FF6B6B', '#00CCB3'],
    data: buildDataPalette(['#FF6B6B', '#00CCB3', '#FFC800']),
  },
  candy_pop: {
    label: 'Candy Pop',
    description: 'Pink + Blue',
    primary: '#FF479C',
    secondary: '#00C2FF',
    tertiary: '#FFE100',
    destructive: shared.destructive,
    gradient: ['#FF479C', '#00C2FF'],
    data: buildDataPalette(['#FF479C', '#00C2FF', '#FFE100']),
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
