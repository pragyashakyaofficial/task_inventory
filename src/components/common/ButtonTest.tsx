import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const ButtonTest: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const SimpleAnimatedButton = ({ 
    title, 
    onPress, 
    variant = 'primary',
    disabled = false,
    loading = false,
    style 
  }: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'error' | 'outline';
    disabled?: boolean;
    loading?: boolean;
    style?: any;
  }) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (!disabled && !loading) {
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (!disabled && !loading) {
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    };

    const getButtonColors = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: disabled ? theme.colors.borderLight : theme.colors.primary,
            borderColor: theme.colors.primary,
          };
        case 'secondary':
          return {
            backgroundColor: disabled ? theme.colors.borderLight : theme.colors.gray,
            borderColor: theme.colors.gray,
          };
        case 'error':
          return {
            backgroundColor: disabled ? theme.colors.error : theme.colors.error,
            borderColor: theme.colors.error,
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderColor: disabled ? theme.colors.border : theme.colors.primary,
          };
        default:
          return {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          };
      }
    };

    const colors = getButtonColors();

    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
        <TouchableOpacity
          style={[
            styles.button,
            colors,
            variant === 'outline' && styles.outlineButton,
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.buttonText,
            { color: variant === 'outline' ? (disabled ? theme.colors.gray : theme.colors.primary) : theme.colors.white }
          ]}>
            {loading ? 'Loading...' : title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Animated Button Test</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Button Variants</Text>
        
        <View style={styles.row}>
          <SimpleAnimatedButton
            title="Primary"
            onPress={() => console.log('Primary pressed')}
            variant="primary"
            style={styles.buttonContainer}
          />
          <SimpleAnimatedButton
            title="Secondary"
            onPress={() => console.log('Secondary pressed')}
            variant="secondary"
            style={styles.buttonContainer}
          />
        </View>
        
        <View style={styles.row}>
          <SimpleAnimatedButton
            title="Error"
            onPress={() => console.log('Error pressed')}
            variant="error"
            style={styles.buttonContainer}
          />
          <SimpleAnimatedButton
            title="Outline"
            onPress={() => console.log('Outline pressed')}
            variant="outline"
            style={styles.buttonContainer}
          />
        </View>
        
        <View style={styles.row}>
          <SimpleAnimatedButton
            title={loading ? 'Loading...' : 'Loading Test'}
            onPress={handleLoading}
            loading={loading}
            style={styles.buttonContainer}
          />
          <SimpleAnimatedButton
            title="Disabled"
            onPress={() => {}}
            disabled
            style={styles.buttonContainer}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Button Sizes</Text>
        
        <View style={styles.row}>
          <SimpleAnimatedButton
            title="Small"
            onPress={() => console.log('Small pressed')}
            style={[styles.buttonContainer, styles.smallButton]}
          />
          <SimpleAnimatedButton
            title="Medium"
            onPress={() => console.log('Medium pressed')}
            style={styles.buttonContainer}
          />
          <SimpleAnimatedButton
            title="Large"
            onPress={() => console.log('Large pressed')}
            style={[styles.buttonContainer, styles.largeButton]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flex: 1,
    minWidth: 120,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 44,
  },
  outlineButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  smallButton: {
    minWidth: 80,
  },
  largeButton: {
    minWidth: 160,
  },
});

export default ButtonTest;
