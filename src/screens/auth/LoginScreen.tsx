import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';

type Props = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();

  const handleDemoLogin = () => {
    // Dispatch login action to update Redux state
    dispatch({ type: 'LOGIN_SUCCESS' });
    Alert.alert('Success', 'Demo login successful! You are now authenticated.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Text style={styles.subtitle}>Demo Login</Text>
      
      <TouchableOpacity style={styles.loginButton} onPress={handleDemoLogin}>
        <Text style={styles.loginButtonText}>Login as Demo User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
