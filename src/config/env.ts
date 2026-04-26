import Config from 'react-native-config';

interface EnvConfig {
  readonly APP_NAME: string;
  readonly API_BASE_URL: string;
  readonly ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly DEBUG_MODE: boolean;
  readonly LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  readonly API_TIMEOUT: number;
}

// Environment configuration with validation/defaults
export const ENV: EnvConfig = {
  APP_NAME: Config.APP_NAME ?? 'InventoryApp',
  API_BASE_URL: Config.API_BASE_URL ?? 'http://localhost:3000/v1',
  ENVIRONMENT: (Config.ENVIRONMENT as EnvConfig['ENVIRONMENT']) ?? 'development',
  DEBUG_MODE: Config.DEBUG_MODE === 'true',
  LOG_LEVEL: (Config.LOG_LEVEL as EnvConfig['LOG_LEVEL']) ?? 'debug',
  API_TIMEOUT: Number(Config.API_TIMEOUT ?? 10000),
} as const;

// Helper functions
export const isDevelopment = () => ENV.ENVIRONMENT === 'development';
export const isStaging = () => ENV.ENVIRONMENT === 'staging';
export const isProduction = () => ENV.ENVIRONMENT === 'production';
export const isDebugMode = () => ENV.DEBUG_MODE;

// Log environment info in development safely
if (isDevelopment() && !__DEV__) {
  // Only log if not in production build to avoid leaking sensitive info
  console.log('Environment Config Loaded:', ENV.ENVIRONMENT);
}