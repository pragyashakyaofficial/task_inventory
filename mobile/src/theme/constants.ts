export const colors = {
  primary: '#4a8fc7',
  primaryDark: '#5fa3d8',
  secondary: '#8b5fc7',
  secondaryDark: '#a573d8',
  
  background: '#1a1f2e',
  backgroundSecondary: '#2a3441',
  backgroundTertiary: '#3a4556',
  
  text: '#ffffff',
  textSecondary: '#adceed',
  textTertiary: '#99add0',
  textQuaternary: '#99afc2',
  
  border: '#3a4556',
  borderLight: '#4a5568',
  separator: '#3a4556',
  
  success: '#4ade80',
  successDark: '#22c55e',
  warning: '#fbbf24',
  warningDark: '#f59e0b',
  error: '#f87171',
  errorDark: '#ef4444',
  info: '#60a5fa',
  
  overlay: 'rgba(0,0,0,0.7)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  
  white: '#ffffff',
  black: '#000000',
  gray: '#9fb1c7',
  grayLight: '#4a5568',
  grayDark: '#d1d9e6',
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const spacingSemantic = {
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  container: spacing.md,
  section: spacing.xl,
  screen: spacing.lg,
  buttonPadding: {
    horizontal: spacing.md,
    vertical: spacing.sm,
  },
  cardPadding: spacing.md,
  inputPadding: {
    horizontal: spacing.md,
    vertical: spacing.sm,
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
