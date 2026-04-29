import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Package, Plus, ShoppingCart, User } from 'lucide-react-native';
import { colors } from '../theme/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import InventoryListScreen from '../features/inventory/screens/InventoryListScreen';
import ItemDetailScreen from '../features/inventory/screens/ItemDetailScreen';
import AddEditItemScreen from '../features/inventory/screens/AddEditItemScreen';
import OrdersScreen from '../features/inventory/screens/OrdersScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const InventoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InventoryList" component={InventoryListScreen} />
    <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    <Stack.Screen name="AddEditItem" component={AddEditItemScreen} />
  </Stack.Navigator>
);

const CustomTabBarButton = ({ children, onPress }: any) => {
  return (
    <TouchableOpacity
      style={[styles.fabContainer, { backgroundColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

export const MainStack = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? insets.bottom : 20,
          marginLeft: '2.5%',
          right: '2.5%',
          width: '95%',
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 65,
          height: 65,
          borderTopWidth: 0,
          // shadowColor: '#000',
          // shadowOffset: { width: 0, height: 10 },
          // shadowOpacity: 0.1,
          // shadowRadius: 10,
          paddingTop: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          height: 58,
          paddingBottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
          marginBottom: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarButton: (props: any) => {
          const { style, ...rest } = props;
          return (
            <TouchableOpacity
              {...rest}
              style={style}
              activeOpacity={1}
            />
          );
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Home 
              size={size} 
              color={color} 
              fill={focused ? color : 'transparent'} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
            // Reset the Inventory stack to show InventoryList
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Inventory',
                params: {
                  screen: 'InventoryList',
                },
              })
            );
          },
        })}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Package 
              size={size} 
              color={color} 
              fill={focused ? color : 'transparent'} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddEditItemScreen}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Plus size={30} color="white" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <ShoppingCart
              size={size}
              color={color}
              fill={focused ? color : 'transparent'}
            />
          ),
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              size={size} 
              color={color} 
              fill={focused ? color : 'transparent'} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
