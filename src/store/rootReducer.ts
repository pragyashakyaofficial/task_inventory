import { combineReducers } from '@reduxjs/toolkit';

// Import your reducers here
// import { apiSlice } from '../api/baseApi';

// Create a simple placeholder reducer
const placeholderReducer = (state = {}, action: any) => {
  return state;
};

export const rootReducer = combineReducers({
  // Add your reducers here
  // api: apiSlice.reducer,
  placeholder: placeholderReducer,
});
