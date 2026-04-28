import React, { memo } from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  reducedTransparencyFallbackColor?: string;
  onPress?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = memo(({
  children,
  style,
  reducedTransparencyFallbackColor,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  const cardStyle = onPress ? animatedStyle : {};

  return (
    <CardComponent
      style={[
        styles.container,
        {
          backgroundColor: reducedTransparencyFallbackColor || 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        cardStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
      onPress={onPress}
    >
      <View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </CardComponent>
  );
});

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    zIndex: 1,
  },
});

export default GlassCard;
