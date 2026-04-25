import React, { useState } from 'react';
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
  FadeInDown,
  FadeInUp,
  Layout,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      buttonScale.value = withSpring(0.95, undefined, (finished?: boolean) => {});
      
      // TODO: Implement actual registration logic
      console.log('Register data:', data);
      
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1, undefined, (finished?: boolean) => {});
    }
  };

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
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </Animated.View>

          {/* Register Form */}
          <Animated.View
            entering={FadeInUp.duration(1000).springify()}
            layout={Layout.springify()}
          >
            <GlassCard style={styles.formCard}>
              <View style={styles.formContent}>
                {/* Name Field */}
                <Animated.View
                  entering={FadeInUp.delay(200).duration(800).springify()}
                >
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
                </Animated.View>

                {/* Email Field */}
                <Animated.View
                  entering={FadeInUp.delay(300).duration(800).springify()}
                >
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
                </Animated.View>

                {/* Password Field */}
                <Animated.View
                  entering={FadeInUp.delay(400).duration(800).springify()}
                >
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
                </Animated.View>

                {/* Confirm Password Field */}
                <Animated.View
                  entering={FadeInUp.delay(500).duration(800).springify()}
                >
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
                </Animated.View>

                {/* Terms and Conditions */}
                <Animated.View
                  entering={FadeInUp.delay(600).duration(800).springify()}
                >
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </Animated.View>

                {/* Register Button */}
                <Animated.View
                  entering={FadeInUp.delay(700).duration(800).springify()}
                >
                  <Animated.View style={buttonAnimatedStyle}>
                    <Button
                      title={isLoading ? 'Creating Account...' : 'Create Account'}
                      onPress={handleSubmit(onSubmit)}
                      disabled={!isValid || isLoading}
                      loading={isLoading}
                      style={styles.registerButton}
                    />
                  </Animated.View>
                </Animated.View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            entering={FadeInUp.delay(800).duration(800).springify()}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
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
  formCard: {
    padding: 0,
    overflow: 'hidden',
  },
  formContent: {
    padding: 24,
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
