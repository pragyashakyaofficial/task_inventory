import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'error' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'medium',
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...props
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    return {
      opacity: rippleOpacity.value,
      transform: [{ scale: rippleScale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      rippleOpacity.value = withTiming(0.3, { duration: 150 });
      rippleScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
      rippleScale.value = withSpring(1.5, { damping: 15, stiffness: 400 });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      runOnJS(onPress)();
    }
  };

  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.borderLight : theme.colors.primary,
          borderColor: theme.colors.primary,
          textColor: theme.colors.white,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.colors.borderLight : theme.colors.gray,
          borderColor: theme.colors.gray,
          textColor: theme.colors.white,
        };
      case 'error':
        return {
          backgroundColor: disabled ? theme.colors.error : theme.colors.error,
          borderColor: theme.colors.error,
          textColor: theme.colors.white,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
          textColor: disabled ? theme.colors.gray : theme.colors.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          textColor: theme.colors.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 12,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 10,
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchableOpacity
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: !!(disabled || loading),
        busy: !!loading,
      }}
      style={[
        styles.button,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          width: fullWidth ? '100%' : undefined,
        },
        sizeStyles,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          styles.ripple,
          rippleStyle,
        ]}
      />
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.textColor}
          style={styles.loader}
        />
      ) : (
        <React.Fragment>
          {leftIcon}
          <Text
            style={[
              styles.text,
              {
                color: colors.textColor,
                fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </React.Fragment>
      )}
    </AnimatedTouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    padding: 2,
  },
  ripple: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
  },
});

export default Button;
