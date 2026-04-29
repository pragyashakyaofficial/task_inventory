import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/constants';

const ButtonTest: React.FC = () => {
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
    const scaleValue = useRef(new Animated.Value(1)).current;

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
            backgroundColor: disabled ? colors.borderLight : colors.primary,
            borderColor: colors.primary,
          };
        case 'secondary':
          return {
            backgroundColor: disabled ? colors.borderLight : colors.textTertiary,
            borderColor: colors.textTertiary,
          };
        case 'error':
          return {
            backgroundColor: colors.error,
            borderColor: colors.error,
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderColor: disabled ? colors.border : colors.primary,
          };
        default:
          return {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          };
      }
    };

    const buttonColors = getButtonColors();

    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
        <TouchableOpacity
          style={[
            styles.button,
            buttonColors,
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
            { color: variant === 'outline' ? (disabled ? colors.textTertiary : colors.primary) : colors.white }
          ]}>
            {loading ? 'Loading...' : title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Animated Button Test</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Button Variants</Text>
        
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Button Sizes</Text>
        
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
    </ScrollView>
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
