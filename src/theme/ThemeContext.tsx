import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animated, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Colors } from './colors';
import { typography, TypographyStyle } from './typography';
import { spacing, SpacingValue } from './spacing';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: Colors;
  typography: typeof typography;
  spacing: typeof spacing;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  animatedValue: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@inventory_app_theme';

const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  typography,
  spacing,
  isDark: mode === 'dark',
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);
  const animatedValue = new Animated.Value(themeMode === 'dark' ? 1 : 0);

  // Load saved theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
        } catch (error) {
          console.warn('Failed to save theme to storage:', error);
        }
      };

      saveTheme();
    }
  }, [themeMode, isLoading]);

  // Animate theme transition
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: themeMode === 'dark' ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // We'll use this for color interpolation
    }).start();
  }, [themeMode, animatedValue]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const theme = createTheme(themeMode);

  if (isLoading) {
    // Return a simple loading state with default theme
    return (
      <ThemeContext.Provider
        value={{
          theme: createTheme('light'),
          toggleTheme,
          setTheme,
          animatedValue: new Animated.Value(0),
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        animatedValue,
      }}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="light-content"
        translucent={true}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for creating animated styles
export const useAnimatedColor = (
  lightColor: string,
  darkColor: string,
  animatedValue?: Animated.Value
) => {
  const { animatedValue: themeAnimatedValue } = useTheme();
  const value = animatedValue || themeAnimatedValue;
  
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [lightColor, darkColor],
  });
};

// Helper hook for creating themed styles
export const useThemedStyle = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return styleFactory(theme);
};

// Helper for creating color-aware styles
export const createThemedStyle = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
) => styleFactory;
