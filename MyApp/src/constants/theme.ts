import { useColorScheme } from 'react-native';

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const MaxContentWidth = 520;
/** Height reserved at the bottom of scroll views so content clears the floating tab bar. */
export const TabBarClearance = 96;

type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  success: string;
  track: string;
  protein: string;
  carb: string;
  fat: string;
  calories: string;
  tabBar: string;
  danger: string;
};

const light: Palette = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F6',
  card: '#FFFFFF',
  text: '#0E1726',
  textMuted: '#69748A',
  border: '#E2E7F0',
  accent: '#208AEF',
  accentSoft: '#E1EFFF',
  success: '#1FB365',
  track: '#E6EAF2',
  protein: '#3B82F6',
  carb: '#F59E0B',
  fat: '#EF4444',
  calories: '#208AEF',
  tabBar: '#FFFFFF',
  danger: '#EF4444',
};

const dark: Palette = {
  background: '#0B0F17',
  surface: '#141A24',
  surfaceAlt: '#1B2330',
  card: '#161D28',
  text: '#F4F7FB',
  textMuted: '#94A0B4',
  border: '#232C3A',
  accent: '#3B9BFF',
  accentSoft: '#17304C',
  success: '#2ECC71',
  track: '#232C3A',
  protein: '#60A5FA',
  carb: '#FBBF24',
  fat: '#F87171',
  calories: '#3B9BFF',
  tabBar: '#151C27',
  danger: '#F87171',
};

export type Theme = {
  colors: Palette;
  dark: boolean;
  spacing: typeof Spacing;
  radii: typeof Radii;
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? dark : light,
    dark: isDark,
    spacing: Spacing,
    radii: Radii,
  };
}
