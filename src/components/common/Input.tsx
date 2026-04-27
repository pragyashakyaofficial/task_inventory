import React, { useState, memo } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { spacingSemantic } from '../../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  required?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = memo(({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperTextStyle,
  required = false,
  onChangeText,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  showPasswordToggle = false,
  secureTextEntry,
  leftIcon,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const borderColor = useSharedValue(theme.colors.border);
  const borderWidth = useSharedValue(1);
  const labelScale = useSharedValue(1);
  const labelTranslateY = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: borderColor.value,
      borderWidth: borderWidth.value,
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: labelScale.value },
        { translateY: labelTranslateY.value },
      ],
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withSpring(theme.colors.primary, { damping: 15, stiffness: 400 });
    borderWidth.value = withSpring(2, { damping: 15, stiffness: 400 });
    
    if (props.value) {
      labelScale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
      labelTranslateY.value = withSpring(-20, { damping: 15, stiffness: 400 });
    }
    
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    
    if (error) {
      borderColor.value = withSpring(theme.colors.error, { damping: 15, stiffness: 400 });
    } else {
      borderColor.value = withSpring(theme.colors.border, { damping: 15, stiffness: 400 });
    }
    borderWidth.value = withSpring(1, { damping: 15, stiffness: 400 });
    
    if (!props.value) {
      labelScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
    
    onBlur?.(e);
  };

  const handleTextChange = (text: string) => {
    if (text && !isFocused) {
      labelScale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
      labelTranslateY.value = withSpring(-20, { damping: 15, stiffness: 400 });
    } else if (!text && !isFocused) {
      labelScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
    
    onChangeText?.(text);
  };

  React.useEffect(() => {
    if (props.value) {
      labelScale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
      labelTranslateY.value = withSpring(-20, { damping: 15, stiffness: 400 });
    }
    
    if (error) {
      borderColor.value = withSpring(theme.colors.error, { damping: 15, stiffness: 400 });
      borderWidth.value = withSpring(2, { damping: 15, stiffness: 400 });
    }
  }, [props.value, error]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              color: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary,
              // backgroundColor: theme.colors.background,
              paddingHorizontal: 4,
              zIndex: 1,
            },
            animatedLabelStyle,
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>}
        </Animated.Text>
      )}
      
      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.backgroundSecondary },
          animatedBorderStyle,
          error && styles.errorInput,
        ]}
      >
        <TextInput
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled: props.editable === false,
          }}
          style={[
            styles.input,
            error && styles.errorInput,
            { color: theme.colors.text },
            showPasswordToggle && styles.inputWithToggle,
            inputStyle,
          ]}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={20} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }, errorStyle]}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }, helperTextStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacingSemantic.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacingSemantic.xs * 1.5,
    alignSelf: 'flex-start',
    marginLeft: spacingSemantic.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
  },
  inputContainer: {
    borderRadius: spacingSemantic.borderRadius.md,
    position: 'relative',
    borderWidth: 1,
  },
  input: {
    paddingHorizontal: spacingSemantic.md,
    paddingVertical: spacingSemantic.sm * 1.5,
    fontSize: 16,
    borderRadius: spacingSemantic.borderRadius.md,
    flex: 1,
  },
  leftIconContainer: {
    paddingLeft: spacingSemantic.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWithToggle: {
    paddingRight: 45,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorInput: {
    borderRadius: spacingSemantic.borderRadius.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacingSemantic.xs,
    marginLeft: spacingSemantic.xs,
  },
  helperText: {
    fontSize: 12,
    marginTop: spacingSemantic.xs,
    marginLeft: spacingSemantic.xs,
  },
});

export default Input;
