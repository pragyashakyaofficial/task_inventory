import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from './ThemeContext';
import { spacingSemantic } from './spacing';

export const createGlobalStyles = (theme: Theme) => {
  const { colors, typography, spacing } = theme;

  return StyleSheet.create({
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
      ...typography.buttonMedium,
      color: colors.white,
    } as TextStyle,

    buttonTextSecondary: {
      ...typography.buttonMedium,
      color: colors.primary,
    } as TextStyle,

    // Input styles
    inputContainer: {
      marginBottom: spacing[4],
    } as ViewStyle,

    input: {
      ...typography.input,
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
      ...typography.label,
      color: colors.textSecondary,
      marginBottom: spacing[2],
    } as TextStyle,

    errorText: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing[1],
    } as TextStyle,

    // Text styles
    title: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing[4],
    } as TextStyle,

    subtitle: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing[3],
    } as TextStyle,

    heading: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing[2],
    } as TextStyle,

    body: {
      ...typography.body1,
      color: colors.text,
      marginBottom: spacing[2],
    } as TextStyle,

    caption: {
      ...typography.caption,
      color: colors.textTertiary,
    } as TextStyle,

    // Status styles
    successText: {
      ...typography.body2,
      color: colors.success,
    } as TextStyle,

    warningText: {
      ...typography.body2,
      color: colors.warning,
    } as TextStyle,

    infoText: {
      ...typography.body2,
      color: colors.info,
    } as TextStyle,

    // Divider styles
    divider: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing[4],
    } as ViewStyle,

    dividerHorizontal: {
      width: 1,
      backgroundColor: colors.separator,
      marginHorizontal: spacing[4],
    } as ViewStyle,

    // List styles
    listItem: {
      backgroundColor: colors.backgroundSecondary,
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    } as ViewStyle,

    listItemLast: {
      backgroundColor: colors.backgroundSecondary,
      padding: spacing[4],
      borderBottomWidth: 0,
    } as ViewStyle,

    // Header styles
    header: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
      paddingHorizontal: spacingSemantic.screen,
      paddingVertical: spacing[3],
    } as ViewStyle,

    headerTitle: {
      ...typography.h4,
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
      padding: spacing[6],
      margin: spacing[4],
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
};

export type GlobalStyles = ReturnType<typeof createGlobalStyles>;
