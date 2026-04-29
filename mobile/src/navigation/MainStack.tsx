import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import AISuggestionsScreen from '../features/ai/screens/AISuggestionsScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Suggestions" component={AISuggestionsScreen} />
    </Stack.Navigator>
  );
};

