import { combineReducers } from '@reduxjs/toolkit';
import { inventoryApi } from '../api/slices/inventoryApi';

// Create a simple placeholder reducer with auth state
const placeholderReducer = (state = { isAuthenticated: false }, action: any) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  // Add your reducers here
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  placeholder: placeholderReducer,
});
