import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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
  borderRadius = 4,
  variant = 'rectangular',
  lines = 1,
  spacing = 8,
}) => {

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withTiming(0.7, { duration: 750 }),
        -1,
        true
      ),
    };
  });

  const shimmerGradientStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withRepeat(
            withTiming(200, { duration: 1500 }),
            -1,
            true
          ),
        },
      ],
    };
  });

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
    <View key={index} style={styles.lineContainer}>
      <Animated.View
        style={[
          styles.skeleton,
          getVariantStyle(),
          index === lines - 1 && variant === 'text' && { width: '60%' },
          style,
          animatedStyle,
        ]}
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
            styles.shimmerGradient,
            shimmerGradientStyle,
          ]}
        />
      </Animated.View>
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
          getVariantStyle(),
          style,
          animatedStyle,
        ]}
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
            styles.shimmerGradient,
            shimmerGradientStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-15deg' }],
  },
  lineContainer: {
    marginBottom: 8,
  },
});

export default LoadingSkeleton;
