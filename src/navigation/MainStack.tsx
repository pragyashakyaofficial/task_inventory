import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import InventoryListScreen from '../features/inventory/screens/InventoryListScreen';
import ItemDetailScreen from '../features/inventory/screens/ItemDetailScreen';
import AddEditItemScreen from '../features/inventory/screens/AddEditItemScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="InventoryList" 
        component={InventoryListScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ title: 'Item Details', headerShown: false }}
      />
      <Stack.Screen 
        name="AddEditItem" 
        component={AddEditItemScreen}
        options={{ title: 'Add/Edit Item', headerShown: false }}
      />
    </Stack.Navigator>
  );
};
