import React, { useRef } from 'react';
import {
  Pressable,
  ViewStyle,
  Animated,
  PressableProps,
  StyleSheet,
} from 'react-native';
import { useDebouncedPress } from '../../hooks/useDebouncedPress';
import { colors } from '../../theme/constants';

interface RippleButtonProps extends PressableProps {
  children: React.ReactNode;
  rippleColor?: string;
  style?: ViewStyle;
  delay?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  rippleColor,
  style,
  delay = 300,
  onPress,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { handlePress } = useDebouncedPress({ onPress, delay });
  
  // Use theme-based ripple color if none provided
  const finalRippleColor = rippleColor || colors.overlay;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
      {...props}
    >
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: finalRippleColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  ripple: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
