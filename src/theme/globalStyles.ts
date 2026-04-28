import { colors, typography, spacing, spacingSemantic } from './constants';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacingSemantic.screen,
  } as ViewStyle,

  // Card styles
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacingSemantic.borderRadius.md,
    padding: spacingSemantic.cardPadding,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  cardElevated: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacingSemantic.borderRadius.lg,
    padding: spacingSemantic.cardPadding,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,

  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacingSemantic.borderRadius.md,
    paddingHorizontal: spacingSemantic.buttonPadding.horizontal,
    paddingVertical: spacingSemantic.buttonPadding.vertical,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: spacingSemantic.borderRadius.md,
    paddingHorizontal: spacingSemantic.buttonPadding.horizontal,
    paddingVertical: spacingSemantic.buttonPadding.vertical,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,

  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  } as TextStyle,

  buttonTextSecondary: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  } as TextStyle,

  // Input styles
  inputContainer: {
    marginBottom: spacing.md,
  } as ViewStyle,

  input: {
    fontSize: typography.fontSize.base,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacingSemantic.borderRadius.md,
    paddingHorizontal: spacingSemantic.inputPadding.horizontal,
    paddingVertical: spacingSemantic.inputPadding.vertical,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    minHeight: 44,
  } as ViewStyle,

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  } as ViewStyle,

  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  } as ViewStyle,

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  } as TextStyle,

  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  } as TextStyle,

  // Text styles
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  } as TextStyle,

  subtitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  } as TextStyle,

  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  } as TextStyle,

  body: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: spacing.xs,
  } as TextStyle,

  caption: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  } as TextStyle,

  // Status styles
  successText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
  } as TextStyle,

  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  } as TextStyle,

  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.info,
  } as TextStyle,

  // Divider styles
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  } as ViewStyle,

  dividerHorizontal: {
    width: 1,
    backgroundColor: colors.separator,
    marginHorizontal: spacing.md,
  } as ViewStyle,

  // List styles
  listItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  } as ViewStyle,

  listItemLast: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderBottomWidth: 0,
  } as ViewStyle,

  // Header styles
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    paddingHorizontal: spacingSemantic.screen,
    paddingVertical: spacing.sm,
  } as ViewStyle,

  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  } as TextStyle,

  // Tab bar styles
  tabBar: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    height: 80,
    paddingBottom: 20,
  } as ViewStyle,

  // Loading styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as ViewStyle,

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacingSemantic.borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    maxHeight: '80%',
    width: '90%',
  } as ViewStyle,

  // Flex utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  } as ViewStyle,

  column: {
    flexDirection: 'column',
  } as ViewStyle,

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Position utilities
  absolute: {
    position: 'absolute',
  } as ViewStyle,

  relative: {
    position: 'relative',
  } as ViewStyle,

  // Shadow utilities
  shadowSm: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  shadowMd: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  shadowLg: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
});
