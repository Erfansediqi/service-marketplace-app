import { Platform } from 'react-native';

export const Colors = {
  primary: '#6C5CE7',
  primaryDark: '#5746D9',
  secondary: '#00C896',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',

  border: '#E2E8F0',
  muted: '#CBD5E1',

  success: '#16A34A',
  error: '#DC2626',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Typography = {
  title: 24,
  subtitle: 14,
  body: 16,
  caption: 13,
  button: 16,
} as const;

export const Fonts = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  default: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    bold: 'sans-serif',
  },
});