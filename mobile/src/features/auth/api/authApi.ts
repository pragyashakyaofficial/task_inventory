import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../../api/baseQuery';
import { LoginRequest, AuthResponse } from '../types/auth.types';
import { ENDPOINTS } from '../../../api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      transformResponse: (response: AuthResponse) => {
        // Store token in secure storage or state management
        // This is where you'd integrate with AsyncStorage or Keychain
        if (__DEV__) console.log('Login successful');
        return response;
      },
    }),


    // Refresh token endpoint
    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: ENDPOINTS.REFRESH_TOKEN,
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Logout endpoint (if your backend supports it)
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),


  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
