import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '../config/env';

// Base query with error handling
export const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // You can add auth headers here if needed
    // const token = (getState() as RootState).auth.token;
    // if (token) {
    //   headers.set('authorization', `Bearer ${token}`);
    // }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle different status codes
  if (result.error && result.error.status) {
    const { status, data } = result.error;
    
    switch (status) {
      case 400:
        console.error('Bad Request:', data);
        break;
      case 401:
        console.error('Unauthorized:', data);
        // Handle unauthorized - maybe redirect to login
        break;
      case 403:
        console.error('Forbidden:', data);
        break;
      case 404:
        console.error('Not Found:', data);
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
