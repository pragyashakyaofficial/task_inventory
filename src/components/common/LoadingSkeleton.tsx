import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
  spacing?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 12,
  variant = 'rectangular',
  lines = 1,
  spacing = 8,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const getVariantStyle = () => {
    switch (variant) {
      case 'circular':
        return {
          width: typeof width === 'number' ? width : height,
          height: height,
          borderRadius: height / 2,
        };
      case 'text':
        return {
          height: height,
          borderRadius: 4,
        };
      default:
        return {
          width: width as any,
          height: height,
          borderRadius: borderRadius,
        };
    }
  };

  const renderSkeletonLine = (index: number) => (
    <View key={index} style={[styles.lineContainer, { marginBottom: spacing }]}>
      <Animated.View
        style={[
          styles.skeleton,
          { backgroundColor: theme.colors.backgroundSecondary },
          getVariantStyle(),
          index === lines - 1 && variant === 'text' && { width: '60%' },
          style,
          animatedStyle,
        ]}
      />
    </View>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <View style={styles.container}>
        {Array.from({ length: lines }, (_, index) => renderSkeletonLine(index))}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.skeleton,
          { backgroundColor: theme.colors.backgroundSecondary },
          getVariantStyle(),
          style,
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    overflow: 'hidden',
  },
  lineContainer: {
    width: '100%',
  },
});

export default LoadingSkeleton;
