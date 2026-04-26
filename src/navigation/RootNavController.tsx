import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppSelector } from '../store/hooks';

// Delay imports to prevent circular dependency issues
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavController = () => {
  const isAuthenticated = useAppSelector((state) => state.placeholder.isAuthenticated); 

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )} */}
          {isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
           <Stack.Screen name="Main" component={MainStack} />
          
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
