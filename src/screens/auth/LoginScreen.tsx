import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { useThemedStyle } from '../../theme/ThemeContext';
import { createGlobalStyles } from '../../theme/globalStyles';
import { ThemeToggle } from '../../components/common';

type Props = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const globalStyles = useThemedStyle(createGlobalStyles);

  const handleDemoLogin = () => {
    // Dispatch login action to update Redux state
    dispatch({ type: 'LOGIN_SUCCESS' });
    Alert.alert('Success', 'Demo login successful! You are now authenticated.');
  };

  return (
    <View style={globalStyles.screenContainer}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Login</Text>
        <ThemeToggle />
      </View>
      
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Welcome Back!</Text>
        <Text style={globalStyles.body}>Demo Login</Text>
        
        <TouchableOpacity style={globalStyles.button} onPress={handleDemoLogin}>
          <Text style={globalStyles.buttonText}>Login as Demo User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
