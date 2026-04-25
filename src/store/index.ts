import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './rootReducer';
import { inventoryApi } from '../api/slices/inventoryApi';

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [], // Add reducers you want to persist here
  blacklist: ['inventoryApi'], // Don't persist api cache
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
        ],
      },
    }).concat(inventoryApi.middleware),
  devTools: __DEV__,
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;