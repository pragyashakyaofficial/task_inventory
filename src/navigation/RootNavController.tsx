import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MainStack } from './MainStack';
import { AuthNavigator as AuthStack } from '../features/auth/navigation/AuthNavigator';

export const RootNavController = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
