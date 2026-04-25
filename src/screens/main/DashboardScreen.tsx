import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MainStackScreenProps } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { useThemedStyle } from '../../theme/ThemeContext';
import { createGlobalStyles } from '../../theme/globalStyles';
import { ThemeToggle } from '../../components/common';

type Props = MainStackScreenProps<'Dashboard'>;

export const DashboardScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const globalStyles = useThemedStyle(createGlobalStyles);

  const handleLogout = () => {
    // Dispatch logout action to update Redux state
    dispatch({ type: 'LOGOUT' });
    Alert.alert('Success', 'You have been logged out.');
  };

  return (
    <View style={globalStyles.screenContainer}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Dashboard</Text>
        <ThemeToggle />
      </View>
      
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Welcome!</Text>
        <Text style={globalStyles.body}>This is your inventory dashboard.</Text>
        
        <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
          <Text style={globalStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
