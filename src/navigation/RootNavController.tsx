import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MainStack } from './MainStack';
import { AuthNavigator as AuthStack } from '../features/auth/navigation/AuthNavigator';
import { StatusBar } from 'react-native';
import { colors } from '../theme/constants';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.backgroundSecondary,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export const RootNavController = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer theme={AppTheme}>
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
};
