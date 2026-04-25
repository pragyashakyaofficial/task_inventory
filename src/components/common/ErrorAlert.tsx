import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  showRetry?: boolean;
  showDismiss?: boolean;
  variant?: 'danger' | 'warning';
  style?: ViewStyle;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  retryText = 'Retry',
  dismissText = 'Dismiss',
  showRetry = true,
  showDismiss = true,
  variant = 'danger',
  style,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handleRetry = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      onRetry?.();
    }, 100);
  };

  const handleDismiss = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          backgroundColor: theme.colors.warning + '20',
          borderColor: theme.colors.warning,
          iconColor: theme.colors.warning,
          textColor: theme.colors.warningDark,
        };
      default:
        return {
          backgroundColor: theme.colors.error + '20',
          borderColor: theme.colors.error,
          iconColor: theme.colors.error,
          textColor: theme.colors.errorDark,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>
          {variant === 'warning' ? '⚠️' : '❌'}
        </Text>
        <Text style={[styles.title, { color: variantStyles.textColor }]}>
          {variant === 'warning' ? 'Warning' : 'Error'}
        </Text>
      </View>
      
      <Text style={[styles.message, { color: variantStyles.textColor }]}>
        {error}
      </Text>
      
      <View style={styles.actions}>
        {showRetry && onRetry && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.retryButton,
              {
                backgroundColor: variantStyles.iconColor,
              },
            ]}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
        
        {showDismiss && onDismiss && (
          <TouchableOpacity
            style={[styles.button, styles.dismissButton, { borderColor: theme.colors.border }]}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={[styles.dismissButtonText, { color: theme.colors.gray }]}>
              {dismissText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginVertical: 8,
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  retryButton: {
    // backgroundColor will be set dynamically
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButtonText: {
    color: '#6b7280',
  },
});

export default ErrorAlert;
