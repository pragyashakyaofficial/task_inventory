import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import GlassCard from '../../../components/common/GlassCard';
import Input from '../../../components/common/Input';
import { colors } from '../../../theme/constants';

import { useLoginMutation } from '../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const { width, height } = Dimensions.get('window');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [apiError, setApiError] = useState<string>('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const validate = (): boolean => {
    let valid = true;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setApiError('');
    try {
      const response = await login({ email, password }).unwrap();

      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));

    } catch (error: any) {
      const message = error?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(message);
    }
  };

  const isLoading = isLoginLoading;
  const isFormValid = email.length > 0 && password.length >= 6 && emailRegex.test(email);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle="light-content"
      />
      {/* Gradient Background using pure React Native */}
      <View style={styles.gradientBackground}>
        <View style={styles.gradientOverlay1} />
        <View style={styles.gradientOverlay2} />
        <View style={styles.gradientOverlay3} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Brand Section */}
            <View style={styles.brandSection}>
            </View>

            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to manage your inventory</Text>
            </View>

            {/* Login Form Card */}
            <View style={styles.formCardContainer}>
              <GlassCard style={styles.formCard}>
                <View style={styles.formContent}>
                  {/* Email Field */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <Input
                      placeholder="john@example.com"
                      value={email}
                      onChangeText={(text) => { setEmail(text); if (emailError) setEmailError(''); }}
                      onBlur={() => {
                        if (!email) setEmailError('Email is required');
                        else if (!emailRegex.test(email)) setEmailError('Invalid email format');
                      }}
                      error={emailError}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                    />
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <Input
                      placeholder="••••••••"
                      value={password}
                      onChangeText={(text) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                      onBlur={() => {
                        if (!password) setPasswordError('Password is required');
                        else if (password.length < 6) setPasswordError('Password must be at least 6 characters');
                      }}
                      error={passwordError}
                      secureTextEntry
                      showPasswordToggle
                    />
                  </View>

                  {/* Remember Me & Forgot Password Row */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* API Error Helper Text */}
                  {!!apiError && (
                    <View style={styles.errorHelperContainer}>
                      <Text style={styles.errorHelperIcon}>⚠</Text>
                      <Text style={styles.errorHelperText}>{apiError}</Text>
                    </View>
                  )}

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      (!isFormValid || isLoading) && styles.loginButtonDisabled
                    ]}
                    onPress={onSubmit}
                    disabled={!isFormValid || isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',

  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCardContainer: {
    marginBottom: 24,
  },
  formCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  formContent: {
    padding: 24,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
    // marginTop: 4,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  errorHelperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorHelperIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  errorHelperText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,

  },
  loginButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  registerText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  registerLinkText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});