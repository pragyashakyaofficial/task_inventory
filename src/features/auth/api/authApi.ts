import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../api/baseQuery';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { ENDPOINTS } from '../../../api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
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
        console.log('Login successful:', response);
        return response;
      },
    }),

    // Register endpoint
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: ENDPOINTS.REGISTER,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
      transformResponse: (response: AuthResponse) => {
        console.log('Registration successful:', response);
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
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get current user profile
    getCurrentUser: builder.query<AuthResponse['user'], void>({
      query: () => ENDPOINTS.PROFILE,
      providesTags: ['Auth'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
