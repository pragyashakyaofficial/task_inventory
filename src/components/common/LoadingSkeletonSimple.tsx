import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';

interface LoadingSkeletonSimpleProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
  spacing?: number;
}

const LoadingSkeletonSimple: React.FC<LoadingSkeletonSimpleProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 4,
  variant = 'rectangular',
  lines = 1,
  spacing = 8,
}) => {
  const getVariantStyle = (): ViewStyle => {
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
          width: width as DimensionValue,
          height: height,
          borderRadius: borderRadius,
        };
    }
  };

  const renderSkeletonLine = (index: number) => (
    <View key={index} style={styles.lineContainer}>
      <View
        style={[
          styles.skeleton,
          getVariantStyle(),
          index === lines - 1 && variant === 'text' && { width: '60%' },
          style,
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
      <View
        style={[
          styles.skeleton,
          getVariantStyle(),
          style,
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
    backgroundColor: '#e5e7eb',
  },
  lineContainer: {
    marginBottom: 8,
  },
});

export default LoadingSkeletonSimple;
