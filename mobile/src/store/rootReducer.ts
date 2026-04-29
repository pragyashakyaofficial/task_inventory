import { combineReducers, AnyAction } from '@reduxjs/toolkit';
import { inventoryApi } from '../api/slices/inventoryApi';
import { authApi } from '../features/auth/api/authApi';
import authReducer from '../features/auth/store/authSlice';

const appReducer = combineReducers({
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  auth: authReducer,
});

export const rootReducer = (state: any, action: AnyAction) => {
  if (action.type === 'auth/logout') {
    // Clear all state including RTK Query caches on logout
    state = undefined;
  }
  return appReducer(state, action);
};
