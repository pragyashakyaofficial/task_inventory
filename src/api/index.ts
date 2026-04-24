import { ENV } from '@config/env';

// API configuration
export const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Example API endpoints
export const ENDPOINTS = {
  // Inventory endpoints
  INVENTORY: '/inventory',
  INVENTORY_ITEM: (id: string) => `/inventory/${id}`,
  
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  PROFILE: '/user/profile',
  
  // Add more endpoints as needed
} as const;