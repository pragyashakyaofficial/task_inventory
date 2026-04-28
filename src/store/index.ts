import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './rootReducer';
import { authApi } from '../features/auth/api/authApi';
import { inventoryApi } from '../api/slices/inventoryApi';

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [], // No global state persistence needed for this simplified version
  blacklist: ['inventoryApi', 'authApi', 'auth'], // Don't persist anything to speed up startup
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          // RTK Query actions
          'inventoryApi/executeQuery/pending',
          'inventoryApi/executeQuery/fulfilled',
          'inventoryApi/executeQuery/rejected',
          'inventoryApi/executeMutation/pending',
          'inventoryApi/executeMutation/fulfilled',
          'inventoryApi/executeMutation/rejected',
          'authApi/executeQuery/pending',
          'authApi/executeQuery/fulfilled',
          'authApi/executeQuery/rejected',
          'authApi/executeMutation/pending',
          'authApi/executeMutation/fulfilled',
          'authApi/executeMutation/rejected',
        ],
      },
    }).concat(inventoryApi.middleware, authApi.middleware),
  devTools: __DEV__,
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;