import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { ENV } from '../config/env';
import { logout } from '../features/auth/store/authSlice';

// Base query with JWT auth header injection
export const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with auth error handling.
// On 401: clears local auth state and redirects to login (token refresh not implemented for MVP).
export const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const method = args.method || 'GET';
  const url = typeof args === 'string' ? args : args.url;

  if (__DEV__) {
    console.log(`[API Request] ${method} ${url}`);
  }

  let result = await baseQuery(args, api, extraOptions);

  if (__DEV__ && result.data) {
    console.log(`[API Success] ${method} ${url}`);
  }

  if (result.error && result.error.status) {
    const { status, data } = result.error as { status: number; data: any };

    if (__DEV__) {
      console.log(`[API Error] ${status} ${method} ${url}`, data);
    }

    switch (status) {
      case 401:
        // Token expired or invalid — clear auth and redirect to login
        api.dispatch(logout());
        break;
      case 403:
        if (__DEV__) console.error('Forbidden:', data);
        break;
      case 422:
        if (__DEV__) console.error('Validation Error:', data);
        break;
      case 500:
        if (__DEV__) console.error('Server Error:', data);
        break;
      default:
        if (__DEV__) console.error('API Error:', data);
    }
  }

  return result;
};
