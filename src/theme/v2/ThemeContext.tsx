import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_COLOR_THEME, surfaces, themes, type ColorTheme } from './tokens';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ColorMode = 'light' | 'dark';

interface ThemeContextValue {
  /** The active color theme */
  colorTheme: ColorTheme;
  /** Switch color theme — persists to localStorage */
  setColorTheme: (theme: ColorTheme) => void;
  /** Resolved accent tokens for the active theme */
  accents: (typeof themes)[ColorTheme];
  /** Surface tokens for the active color mode */
  surface: (typeof surfaces)['dark'] | (typeof surfaces)['light'];
  /** Current color mode */
  colorMode: ColorMode;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'piggy-pulse-color-theme';

function readStoredTheme(): ColorTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored &&
      (stored === 'nebula' ||
        stored === 'sunrise' ||
        stored === 'neon' ||
        stored === 'tropical' ||
        stored === 'candy_pop' ||
        stored === 'moonlit')
    ) {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, private browsing)
  }
  return DEFAULT_COLOR_THEME;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface V2ThemeProviderProps {
  children: ReactNode;
  /** Override color mode — useful for storybook. If omitted, reads from Mantine colorScheme. */
  colorMode?: ColorMode;
  /** Override color theme — useful for storybook */
  initialColorTheme?: ColorTheme;
}

export function V2ThemeProvider({
  children,
  colorMode = 'dark',
  initialColorTheme,
}: V2ThemeProviderProps) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(
    initialColorTheme ?? readStoredTheme
  );

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const accents = themes[colorTheme];
  const surface = surfaces[colorMode];

  // Apply CSS custom properties to document root
  useEffect(() => {
    const root = document.documentElement;
    // Surfaces
    root.style.setProperty('--v2-bg', surface.background);
    root.style.setProperty('--v2-card', surface.card);
    root.style.setProperty('--v2-elevated', surface.elevated);
    root.style.setProperty('--v2-border', surface.border);
    // Accents
    root.style.setProperty('--v2-primary', accents.primary);
    root.style.setProperty('--v2-secondary', accents.secondary);
    root.style.setProperty('--v2-tertiary', accents.tertiary);
    root.style.setProperty('--v2-destructive', accents.destructive);
    root.style.setProperty('--v2-gradient-start', accents.gradient[0]);
    root.style.setProperty('--v2-gradient-end', accents.gradient[1]);
    if (accents.quaternary) {
      root.style.setProperty('--v2-quaternary', accents.quaternary);
    } else {
      root.style.removeProperty('--v2-quaternary');
    }
  }, [accents, surface]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorTheme,
      setColorTheme,
      accents,
      surface,
      colorMode,
    }),
    [colorTheme, setColorTheme, accents, surface, colorMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useV2Theme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useV2Theme must be used within a V2ThemeProvider');
  }
  return ctx;
}
