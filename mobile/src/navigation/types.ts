import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Inventory Stack Params
export type InventoryStackParamList = {
  InventoryList: undefined;
  ItemDetail: { itemId: string };
  AddEditItem: { itemId?: string };
};

// Main Stack Params
export type MainStackParamList = {
  Dashboard: undefined;
  Inventory: {
    screen: keyof InventoryStackParamList;
    params?: InventoryStackParamList[keyof InventoryStackParamList];
  } | undefined;
  InventoryList: undefined;
  ItemDetail: { itemId: string };
  AddEditItem: { itemId?: string };
  Add: undefined;
  AI: undefined;
  Profile: undefined;
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
