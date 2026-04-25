import Config from 'react-native-config';

// Environment configuration
export const ENV = {
  APP_NAME: Config.APP_NAME || 'InventoryApp',
  API_BASE_URL: Config.API_BASE_URL,
  ENVIRONMENT: Config.ENVIRONMENT || 'development',
  DEBUG_MODE: Config.DEBUG_MODE === 'true',
  LOG_LEVEL: Config.LOG_LEVEL || 'debug',
} as const;

// Helper functions
export const isDevelopment = () => ENV.ENVIRONMENT === 'development';
export const isProduction = () => ENV.ENVIRONMENT === 'production';
export const isDebugMode = () => ENV.DEBUG_MODE;

// Log environment info in development
if (isDevelopment()) {
  console.log('Environment Config:', ENV);
}