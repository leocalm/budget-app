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

export type ColorTheme = 'moonlit' | 'nebula' | 'frost' | 'twilight';

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
  moonlit: {
    label: 'Moonlit',
    description: 'Lavender + Cool Silver — restrained, elegant, purely cool-toned',
    primary: shared.lavender,
    secondary: '#A8B4C4',
    tertiary: '#7AADCF',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#A8B4C4'],
    data: buildDataPalette([shared.lavender, '#A8B4C4', '#7AADCF']),
  },
  nebula: {
    label: 'Nebula',
    description: 'Lavender + Dusty Rose — warm-cool duality, intimate',
    primary: shared.lavender,
    secondary: '#C48BA0',
    tertiary: '#7CA8C4',
    quaternary: '#9AA0CC',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#C48BA0'],
    data: buildDataPalette([shared.lavender, '#C48BA0', '#7CA8C4', '#9AA0CC']),
  },
  frost: {
    label: 'Frost',
    description: 'Lavender + Ice Blue — crisp, strong data readability',
    primary: shared.lavender,
    secondary: '#6EA4C0',
    tertiary: '#A88CB4',
    quaternary: '#7C98B4',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#6EA4C0'],
    data: buildDataPalette([shared.lavender, '#6EA4C0', '#A88CB4', '#7C98B4']),
  },
  twilight: {
    label: 'Twilight',
    description: 'Deep Lavender + Muted Teal — maximum calm',
    primary: shared.lavender,
    secondary: '#6B9EA8',
    tertiary: '#9C82B0',
    quaternary: '#8090B8',
    destructive: shared.destructive,
    gradient: [shared.lavender, '#6B9EA8'],
    data: buildDataPalette([shared.lavender, '#6B9EA8', '#9C82B0', '#8090B8']),
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
