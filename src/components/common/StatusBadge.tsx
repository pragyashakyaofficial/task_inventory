import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

export type StatusType = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showPulse?: boolean;
  customColor?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'medium',
  style,
  showPulse = false,
  customColor,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const dotScale = useSharedValue(1);

  React.useEffect(() => {
    // Initial entrance animation
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    
    // Pulse animation for low stock and out of stock
    if (showPulse && (status === 'low-stock' || status === 'out-of-stock')) {
      pulseOpacity.value = withRepeat(
        withTiming(0.3, { duration: 1000 }),
        -1,
        true
      );
      dotScale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    }
  }, [status, showPulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
      transform: [{ scale: dotScale.value }],
    };
  });

  const getStatusConfig = () => {
    switch (status) {
      case 'in-stock':
        return {
          backgroundColor: customColor || theme.colors.success + '20',
          borderColor: customColor || theme.colors.success,
          textColor: customColor ? theme.colors.white : theme.colors.successDark,
          dotColor: customColor || theme.colors.success,
          defaultText: 'In Stock',
        };
      case 'low-stock':
        return {
          backgroundColor: customColor || theme.colors.warning + '20',
          borderColor: customColor || theme.colors.warning,
          textColor: customColor ? theme.colors.white : theme.colors.warningDark,
          dotColor: customColor || theme.colors.warning,
          defaultText: 'Low Stock',
        };
      case 'out-of-stock':
        return {
          backgroundColor: customColor || theme.colors.error + '20',
          borderColor: customColor || theme.colors.error,
          textColor: customColor ? theme.colors.white : theme.colors.errorDark,
          dotColor: customColor || theme.colors.error,
          defaultText: 'Out of Stock',
        };
      case 'discontinued':
        return {
          backgroundColor: customColor || theme.colors.backgroundSecondary,
          borderColor: customColor || theme.colors.gray,
          textColor: customColor ? theme.colors.white : theme.colors.textSecondary,
          dotColor: customColor || theme.colors.gray,
          defaultText: 'Discontinued',
        };
      case 'pending':
        return {
          backgroundColor: customColor || theme.colors.info + '20',
          borderColor: customColor || theme.colors.info,
          textColor: customColor ? theme.colors.white : theme.colors.primaryDark,
          dotColor: customColor || theme.colors.info,
          defaultText: 'Pending',
        };
      default:
        return {
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: theme.colors.gray,
          textColor: theme.colors.textSecondary,
          dotColor: theme.colors.gray,
          defaultText: 'Unknown',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 10,
          dotSize: 6,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          fontSize: 16,
          dotSize: 10,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 12,
          dotSize: 8,
        };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: sizeStyles.borderRadius,
        },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.dotContainer}>
          {showPulse && (status === 'low-stock' || status === 'out-of-stock') && (
            <Animated.View
              style={[
                styles.pulseDot,
                {
                  backgroundColor: config.dotColor,
                  width: sizeStyles.dotSize,
                  height: sizeStyles.dotSize,
                  borderRadius: sizeStyles.dotSize / 2,
                },
                pulseStyle,
              ]}
            />
          )}
          <View
            style={[
              styles.dot,
              {
                backgroundColor: config.dotColor,
                width: sizeStyles.dotSize,
                height: sizeStyles.dotSize,
                borderRadius: sizeStyles.dotSize / 2,
              },
            ]}
          />
        </View>
        
        <Text
          style={[
            styles.text,
            {
              color: config.textColor,
              fontSize: sizeStyles.fontSize,
              marginLeft: sizeStyles.dotSize / 2 + 4,
            },
          ]}
        >
          {text || config.defaultText}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    // Styles will be set dynamically
  },
  pulseDot: {
    position: 'absolute',
    // Styles will be set dynamically
  },
  text: {
    fontWeight: '500',
    // Styles will be set dynamically
  },
});

export default StatusBadge;
