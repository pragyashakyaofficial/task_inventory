import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined;
};

// Main Stack Params
export type MainStackParamList = {
  Dashboard: undefined;
  Suggestions: { autoFetch?: boolean };
};

// Root Stack Params
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

// Export screen prop types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
