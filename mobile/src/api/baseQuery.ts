import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '../config/env';
import { logout } from '../features/auth/store/authSlice';

// Base query with error handling
export const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    const token = state.auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const method = args.method || 'GET';
  const url = typeof args === 'string' ? args : args.url;
  
  console.log(`[API Request] ${method} ${url}`, args.body ? args.body : '');

  let result = await baseQuery(args, api, extraOptions);

  if (result.data) {
    console.log(`[API Success] ${method} ${url}`, result.data);
  }

  // Handle different status codes
  if (result.error && result.error.status) {
    const { status, data } = result.error as { status: number; data: any };
    console.log(`[API Error] ${status} ${method} ${url}`, data);
    
    switch (status) {
      case 401:
        console.error('Unauthorized:', data);
        // Auto logout on 401
        api.dispatch(logout());
        break;
      case 403:
        console.error('Forbidden:', data);
        break;
      case 422:
        console.error('Validation Error:', data);
        break;
      case 500:
        console.error('Server Error:', data);
        break;
      default:
        console.error('API Error:', data);
    }
  }

  return result;
};
