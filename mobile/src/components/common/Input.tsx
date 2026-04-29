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
import { colors, spacingSemantic } from '../../theme/constants';

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
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: error ? colors.error : isFocused ? colors.primary : colors.textSecondary,
              paddingHorizontal: 4,
              zIndex: 1,
            },
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            borderWidth: isFocused || error ? 2 : 1,
          },
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
            { color: colors.text },
            showPasswordToggle && styles.inputWithToggle,
            inputStyle,
          ]}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textTertiary}
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
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.error }, errorStyle]}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={[styles.helperText, { color: colors.textSecondary }, helperTextStyle]}>
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
