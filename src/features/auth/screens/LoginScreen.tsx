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
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import GlassCard from '../../../components/common/GlassCard';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useThemedStyle, createThemedStyle, Theme } from '../../../theme/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      buttonScale.value = withSpring(0.95);
      
      // TODO: Implement actual login logic
      console.log('Login data:', data);
      
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
    }
  };

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
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            entering={FadeInUp.duration(1000).springify()}
            layout={Layout.springify()}
          >
            <GlassCard style={styles.formCard}>
              <View style={styles.formContent}>
                {/* Email Field */}
                <Animated.View
                  entering={FadeInUp.delay(200).duration(800).springify()}
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
                </Animated.View>

                {/* Forgot Password */}
                <Animated.View
                  entering={FadeInUp.delay(600).duration(800).springify()}
                >
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Login Button */}
                <Animated.View
                  entering={FadeInUp.delay(800).duration(800).springify()}
                >
                  <Animated.View style={buttonAnimatedStyle}>
                    <Button
                      title={isLoading ? 'Signing In...' : 'Sign In'}
                      onPress={handleSubmit(onSubmit)}
                      disabled={!isValid || isLoading}
                      loading={isLoading}
                      style={styles.loginButton}
                    />
                  </Animated.View>
                </Animated.View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(800).springify()}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLinkText}>Sign Up</Text>
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
  formCard: {
    padding: 0,
    overflow: 'hidden',
  },
  formContent: {
    padding: 24,
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
