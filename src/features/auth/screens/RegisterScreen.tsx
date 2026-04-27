import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';
import GlassCard from '../../../components/common/GlassCard';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useThemedStyle, createThemedStyle, Theme } from '../../../theme/ThemeContext';

import { useRegisterMutation } from '../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const buttonScale = useSharedValue(1);
  const styles = useThemedStyle(themedStyles);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      buttonScale.value = withSpring(0.95);
      
      // Prepare request data matching backend requirements
      const requestData = {
        name: data.name,
        email: data.email,
        password: data.password,
        username: data.email.split('@')[0], // Fallback username
        fullName: data.name,
      };

      const response = await register(requestData).unwrap();
      
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      const message = error?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      buttonScale.value = withSpring(1);
    }
  };

  const isLoading = isRegisterLoading;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const getPasswordStrength = (password: string, theme: Theme) => {
    if (!password) return { strength: 0, color: theme.colors.textSecondary, text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-d]/.test(password)) strength++;

    const strengthConfig = [
      { color: theme.colors.error, text: 'Very Weak' },
      { color: theme.colors.error, text: 'Weak' },
      { color: theme.colors.warning, text: 'Fair' },
      { color: theme.colors.success, text: 'Good' },
      { color: theme.colors.success, text: 'Strong' },
    ];

    return {
      strength,
      ...strengthConfig[Math.min(strength - 1, 4)],
    };
  };

  const { theme } = useThemedStyle((t) => ({ theme: t }));
  const passwordStrength = getPasswordStrength(password, theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Register Form */}
          <View style={styles.formCardContainer}>
            <GlassCard style={styles.formCard}>
              <View style={styles.formContent}>
                {/* Name Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }: any) => (
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.name?.message}
                        autoCapitalize="words"
                        autoComplete="name"
                        textContentType="name"
                      />
                    )}
                  />
                </View>

                {/* Email Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }: any) => (
                      <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.email?.message}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                      />
                    )}
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }: any) => (
                      <View>
                        <Input
                          label="Password"
                          placeholder="Create a password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.password?.message}
                          secureTextEntry
                          autoComplete="new-password"
                          textContentType="newPassword"
                        />
                        {password && (
                          <View style={styles.passwordStrength}>
                            <View style={styles.strengthBar}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <View
                                  key={level}
                                  style={[
                                    styles.strengthSegment,
                                    {
                                      backgroundColor:
                                        level <= passwordStrength.strength
                                          ? passwordStrength.color
                                          : theme.colors.border,
                                    },
                                  ]}
                                />
                              ))}
                            </View>
                            <Text
                              style={[
                                styles.strengthText,
                                { color: passwordStrength.color },
                              ]}
                            >
                              {passwordStrength.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  />
                </View>

                {/* Confirm Password Field */}
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }: any) => (
                      <Input
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.confirmPassword?.message}
                        secureTextEntry
                        autoComplete="new-password"
                        textContentType="newPassword"
                      />
                    )}
                  />
                </View>

                {/* Terms and Conditions */}
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>

                {/* Register Button */}
                <Animated.View style={buttonAnimatedStyle}>
                  <Button
                    title={isLoading ? 'Creating Account...' : 'Create Account'}
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    style={styles.registerButton}
                  />
                </Animated.View>
              </View>
            </GlassCard>
          </View>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const themedStyles = createThemedStyle((theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formCardContainer: {
    marginBottom: 20,
  },
  formCard: {
    padding: 0,
    overflow: 'hidden',
  },
  formContent: {
    padding: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  passwordStrength: {
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  registerButton: {
    marginBottom: 16,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loginLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
}));
