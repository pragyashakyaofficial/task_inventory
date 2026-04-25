import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { useTheme, useAnimatedColor, useThemedStyle } from '../../theme/ThemeContext';
import { createGlobalStyles } from '../../theme/globalStyles';

interface ThemeToggleProps {
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { theme, toggleTheme, animatedValue } = useTheme();
  const globalStyles = useThemedStyle(createGlobalStyles);
  
  // Animate icon color
  const iconColor = useAnimatedColor(
    theme.colors.text,
    theme.colors.text
  );

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        globalStyles.card,
        {
          width: size * 2,
          height: size * 1.5,
          borderRadius: size * 0.75,
          paddingHorizontal: size * 0.5,
          backgroundColor: theme.colors.backgroundSecondary,
        },
      ]}
    >
      <Animated.Text
        style={{
          fontSize: size,
          color: theme.colors.text,
          textAlign: 'center',
        }}
      >
        {theme.isDark ? '☀️' : '🌙'}
      </Animated.Text>
    </TouchableOpacity>
  );
};
