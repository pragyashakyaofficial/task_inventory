import { ENV } from '../config/env';

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
  
  // Auth endpoints
  LOGIN: '/api/auth/login',

  REFRESH_TOKEN: '/api/auth/refresh',
  
} as const;