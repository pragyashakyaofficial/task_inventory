import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MainStackScreenProps } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { useThemedStyle } from '../../theme/ThemeContext';
import { createGlobalStyles } from '../../theme/globalStyles';
import { ThemeToggle } from '../../components/common';
import StockCalculatorTest from '../../components/common/StockCalculatorTest';
import { lightColors } from '../../theme/colors';

type Props = MainStackScreenProps<'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const globalStyles = useThemedStyle(createGlobalStyles);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Dispatch logout action to update Redux state
            dispatch({ type: 'LOGOUT' });
            // TODO: Navigate to login screen after logout
            Alert.alert('Success', 'You have been logged out.');
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.screenContainer}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Component Test</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="log-out" 
              size={24} 
              color={lightColors.error} 
            />
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={[globalStyles.button, styles.inventoryButton]} 
          onPress={() => navigation.navigate('InventoryList')}
        >
          <Ionicons name="list" size={24} color="white" style={styles.buttonIcon} />
          <Text style={globalStyles.buttonText}>Go to Inventory List</Text>
        </TouchableOpacity>

        <StockCalculatorTest />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(241, 76, 76, 0.1)',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inventoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    height: 56,
  },
  buttonIcon: {
    marginRight: 10,
  },
});
