import { TextStyle } from 'react-native';

export const fonts = {
  primary: 'System', // San Francisco on iOS, Roboto on Android
  secondary: 'System', // Can be customized to a different font if needed
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xl2: 24,
  xl3: 30,
  xl4: 36,
  xl5: 48,
  xl6: 64,
};

export const fontWeights = {
  thin: '100' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

export interface TypographyStyle extends Omit<TextStyle, 'fontWeight'> {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  lineHeight?: number;
  letterSpacing?: number;
}

export const typography = {
  // Heading styles
  h1: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl4,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl4 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TypographyStyle,

  h2: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl3,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl3 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TypographyStyle,

  h3: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl2,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl2 * lineHeights.tight,
  } as TypographyStyle,

  h4: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TypographyStyle,

  h5: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TypographyStyle,

  h6: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TypographyStyle,

  // Body text styles
  body1: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TypographyStyle,

  body2: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TypographyStyle,

  // Special text styles
  caption: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  } as TypographyStyle,

  overline: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.tight,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
  } as TypographyStyle,

  // Button text styles
  buttonLarge: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TypographyStyle,

  buttonMedium: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TypographyStyle,

  buttonSmall: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TypographyStyle,

  // Input styles
  input: {
    fontFamily: fonts.primary,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TypographyStyle,

  label: {
    fontFamily: fonts.secondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
  } as TypographyStyle,
};
