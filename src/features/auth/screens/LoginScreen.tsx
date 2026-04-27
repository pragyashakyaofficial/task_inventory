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
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import GlassCard from '../../../components/common/GlassCard';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useThemedStyle, createThemedStyle, Theme } from '../../../theme/ThemeContext';

import { useLoginMutation } from '../api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const buttonScale = useSharedValue(1);
  const styles = useThemedStyle(themedStyles);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      buttonScale.value = withSpring(0.95);
      
      const response = await login(data).unwrap();
      
      dispatch(setCredentials({
        user: response.user,
        token: response.token,
      }));

      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      const message = error?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      buttonScale.value = withSpring(1);
    }
  };

  const isLoading = isLoginLoading;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCardContainer}>
            <GlassCard style={styles.formCard}>
              <View style={styles.formContent}>
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
                      <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.password?.message}
                        secureTextEntry
                        autoComplete="password"
                        textContentType="password"
                      />
                    )}
                  />
                </View>

                {/* Forgot Password */}
                {/* <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity> */}

                {/* Login Button */}
                <Animated.View style={buttonAnimatedStyle}>
                  <Button
                    title={isLoading ? 'Signing In...' : 'Sign In'}
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    style={styles.loginButton}
                  />
                </Animated.View>
              </View>
            </GlassCard>
          </View>

          {/* Register Link */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLinkText}>Sign Up</Text>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  registerLinkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
}));
