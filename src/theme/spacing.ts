// 8px grid system for consistent spacing
const baseUnit = 8;

export const spacing = {
  // Base units (multiples of 8px)
  0: 0,
  1: baseUnit * 0.5,  // 4px
  2: baseUnit * 1,    // 8px
  3: baseUnit * 1.5,  // 12px
  4: baseUnit * 2,    // 16px
  5: baseUnit * 2.5,  // 20px
  6: baseUnit * 3,    // 24px
  7: baseUnit * 3.5,  // 28px
  8: baseUnit * 4,    // 32px
  9: baseUnit * 4.5,  // 36px
  10: baseUnit * 5,   // 40px
  11: baseUnit * 5.5, // 44px
  12: baseUnit * 6,   // 48px
  14: baseUnit * 7,   // 56px
  16: baseUnit * 8,   // 64px
  20: baseUnit * 10,  // 80px
  24: baseUnit * 12,  // 96px
  28: baseUnit * 14,  // 112px
  32: baseUnit * 16,  // 128px
  36: baseUnit * 18,  // 144px
  40: baseUnit * 20,  // 160px
  44: baseUnit * 22,  // 176px
  48: baseUnit * 24,  // 192px
  52: baseUnit * 26,  // 208px
  56: baseUnit * 28,  // 224px
  60: baseUnit * 30,  // 240px
  64: baseUnit * 32,  // 256px
  72: baseUnit * 36,  // 288px
  80: baseUnit * 40,  // 320px
  96: baseUnit * 48,  // 384px
} as const;

// Semantic spacing aliases for common use cases
export const spacingSemantic = {
  // Component spacing
  xs: spacing[1],     // 4px - very small gaps
  sm: spacing[2],     // 8px - small gaps
  md: spacing[4],     // 16px - medium gaps
  lg: spacing[6],     // 24px - large gaps
  xl: spacing[8],     // 32px - extra large gaps
  xl2: spacing[12],   // 48px - section spacing
  xl3: spacing[16],   // 64px - major sections

  // Layout spacing
  container: spacing[4],     // 16px - container padding
  section: spacing[8],       // 32px - section spacing
  screen: spacing[6],        // 24px - screen padding

  // Component specific
  buttonPadding: {
    horizontal: spacing[4],  // 16px
    vertical: spacing[2],    // 8px
  },
  
  cardPadding: spacing[4],   // 16px
  inputPadding: {
    horizontal: spacing[3],  // 12px
    vertical: spacing[2],    // 8px
  },
  
  iconSize: {
    xs: spacing[2],     // 8px
    sm: spacing[3],     // 12px
    md: spacing[4],     // 16px
    lg: spacing[6],     // 24px
    xl: spacing[8],     // 32px
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,   // 4px
    md: spacing[1],     // 8px
    lg: spacing[2],     // 16px
    xl: spacing[3],     // 24px
    full: 9999,         // circular
  },

  // Shadow offsets
  shadow: {
    sm: {
      offset: {
        width: 0,
        height: 4, // 4px
      },
    },
    md: {
      offset: {
        width: 0,
        height: spacing[1],   // 8px
      },
    },
    lg: {
      offset: {
        width: 0,
        height: spacing[2],   // 16px
      },
    },
  },
} as const;

// Helper functions for creating margin/padding styles
export const createMarginStyle = (value: keyof typeof spacing) => ({
  margin: spacing[value],
});

export const createPaddingStyle = (value: keyof typeof spacing) => ({
  padding: spacing[value],
});

export const createMarginVerticalStyle = (value: keyof typeof spacing) => ({
  marginVertical: spacing[value],
});

export const createMarginHorizontalStyle = (value: keyof typeof spacing) => ({
  marginHorizontal: spacing[value],
});

export const createPaddingVerticalStyle = (value: keyof typeof spacing) => ({
  paddingVertical: spacing[value],
});

export const createPaddingHorizontalStyle = (value: keyof typeof spacing) => ({
  paddingHorizontal: spacing[value],
});

export type SpacingValue = keyof typeof spacing;
export type SemanticSpacing = keyof typeof spacingSemantic;
