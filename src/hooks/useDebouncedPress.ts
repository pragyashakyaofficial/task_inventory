import { useCallback, useRef } from 'react';
import { Pressable, PressableProps, GestureResponderEvent } from 'react-native';

interface DebouncedPressProps {
  onPress?: ((event: GestureResponderEvent) => void) | null;
  delay?: number;
}

export const useDebouncedPress = ({ onPress, delay = 300 }: DebouncedPressProps) => {
  const lastPressTime = useRef(0);

  const handlePress = useCallback((event: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastPressTime.current > delay) {
      lastPressTime.current = now;
      if (onPress) {
        onPress(event);
      }
    }
  }, [onPress, delay]);

  return { handlePress };
};
