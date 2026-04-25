import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MainStackScreenProps } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { useThemedStyle } from '../../theme/ThemeContext';
import { createGlobalStyles } from '../../theme/globalStyles';
import { ThemeToggle } from '../../components/common';
import ButtonTest from '../../components/common/ButtonTest';

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
        <Text style={globalStyles.headerTitle}>Component Test</Text>
        <ThemeToggle />
      </View>
      
      <ScrollView style={globalStyles.container}>
        <ButtonTest />
        
        <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
          <Text style={globalStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
