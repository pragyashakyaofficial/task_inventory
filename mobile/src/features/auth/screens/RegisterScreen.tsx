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
  DimensionValue,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';
import GlassCard from '../../../components/common/GlassCard';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { colors } from '../../../theme/constants';
import { useRegisterMutation } from '../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: colors.border, text: '', score: 0, width: '0%' as DimensionValue };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthConfig = [
      { color: '#EF4444', text: 'Too weak', width: '20%' as DimensionValue },
      { color: '#F59E0B', text: 'Weak', width: '40%' as DimensionValue },
      { color: '#F59E0B', text: 'Fair', width: '60%' as DimensionValue },
      { color: '#10B981', text: 'Good', width: '80%' as DimensionValue },
      { color: '#10B981', text: 'Strong', width: '100%' as DimensionValue },
    ];

    const config = strengthConfig[Math.min(score, 4)];
    return {
      strength: score,
      color: config.color,
      text: config.text,
      width: config.width,
      score,
    };
  };

  const password = watch('password');
  const passwordStrength = getPasswordStrength(password);
  const isFormValid = isValid && !isRegisterLoading;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const requestData = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        username: data.email.split('@')[0],
        fullName: data.name,
      };

      const response = await register(requestData).unwrap();
      
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));
      
      Alert.alert(
        'Welcome!',
        'Your account has been created successfully.',
        [{ text: 'Continue', style: 'default' }]
      );
    } catch (error: any) {
      const message = error?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      {/* Background stays static as per request */}
      <View style={styles.gradientBackground} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join us and start your journey today
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCardContainer}>
              <GlassCard style={styles.formCard}>
                <View style={styles.formContent}>
                  {/* Name Field */}
                  <View style={styles.inputWrapper}>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          label="Full Name"
                          placeholder="John Doe"
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
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          label="Email Address"
                          placeholder="hello@example.com"
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
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View>
                          <Input
                            label="Password"
                            placeholder="Create a strong password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.password?.message}
                            secureTextEntry
                            showPasswordToggle
                            autoComplete="new-password"
                            textContentType="newPassword"
                          />
                          {value ? (
                            <View style={styles.passwordStrengthContainer}>
                              <View style={styles.strengthBarBackground}>
                                <View
                                  style={[
                                    styles.strengthBarFill,
                                    {
                                      width: passwordStrength.width,
                                      backgroundColor: passwordStrength.color,
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                                {passwordStrength.text}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      )}
                    />
                  </View>

                  {/* Confirm Password Field */}
                  <View style={styles.inputWrapper}>
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          label="Confirm Password"
                          placeholder="Confirm your password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={errors.confirmPassword?.message}
                          secureTextEntry
                          showPasswordToggle
                          autoComplete="new-password"
                          textContentType="newPassword"
                        />
                      )}
                    />
                  </View>

                  {/* Password Requirements */}
                  {password ? (
                    <View style={styles.requirementsContainer}>
                      <Text style={styles.requirementsTitle}>Password requirements:</Text>
                      <View style={stylesInline.requirementsList}>
                        <RequirementItem 
                          text="At least 8 characters"
                          met={password.length >= 8}
                        />
                        <RequirementItem 
                          text="Uppercase & lowercase letters"
                          met={/[a-z]/.test(password) && /[A-Z]/.test(password)}
                        />
                        <RequirementItem 
                          text="Contains a number"
                          met={/\d/.test(password)}
                        />
                        <RequirementItem 
                          text="Contains a special character"
                          met={/[^a-zA-Z0-9]/.test(password)}
                        />
                      </View>
                    </View>
                  ) : null}

                  {/* Terms and Conditions */}
                  {/* <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By creating an account, you agree to our{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View> */}

                  {/* Register Button */}
                  <View style={styles.buttonContainer}>
                    <Button
                      title={isRegisterLoading ? 'Creating Account...' : 'Create Account'}
                      onPress={handleSubmit(onSubmit)}
                      disabled={!isFormValid}
                      loading={isRegisterLoading}
                      style={styles.registerButton}
                      textStyle={styles.registerButtonText}
                    />
                  </View>
                </View>
              </GlassCard>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLinkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// Helper component for requirement items
const RequirementItem: React.FC<{ text: string; met: boolean }> = ({ text, met }) => (
  <View style={stylesInline.requirementItem}>
    <Text style={{ color: met ? "#10B981" : colors.textSecondary, marginRight: 8 }}>
      {met ? "✓" : "○"}
    </Text>
    <Text style={[stylesInline.requirementText, { color: colors.textSecondary }]}>
      {text}
    </Text>
  </View>
);

const stylesInline = {
  requirementItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: 16,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 11,
    marginLeft: 6,
  },
  requirementsList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: colors.primary + '20',
    opacity: 0.3,
  },
  gradientOverlay2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: colors.secondary + '20',
    opacity: 0.3,
  },
  gradientOverlay3: {
    position: 'absolute',
    top: height * 0.3,
    right: -20,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#FF6B6B20',
    opacity: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  content: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCardContainer: {
    marginBottom: 24,
  },
  formCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  formContent: {
    padding: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  strengthBarBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  requirementsContainer: {
    marginTop: 12,
    marginBottom: 20,
    padding: 12,
    backgroundColor: `${colors.textSecondary}08`,
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  buttonContainer: {
    marginTop: 8,
  },
  registerButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
