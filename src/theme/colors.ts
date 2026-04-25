export const lightColors = {
  primary: '#2c5f8a',
  primaryDark: '#1f4668',
  secondary: '#6f42c1',
  secondaryDark: '#5a3290',
  
  background: '#f0f2f8',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#fafcff',
  
  text: '#1f2b38',
  textSecondary: '#3a546d',
  textTertiary: '#5b6e8e',
  textQuaternary: '#6c7f8f',
  
  border: '#e2e8f0',
  borderLight: '#edf2f7',
  separator: '#e2e8f0',
  
  success: '#1e7b4c',
  successDark: '#136b3a',
  warning: '#b6560c',
  warningDark: '#e6a017',
  error: '#c2412c',
  errorDark: '#d9534f',
  info: '#2c5f8a',
  
  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  white: '#ffffff',
  black: '#000000',
  gray: '#6c7f8f',
  grayLight: '#e2e8f0',
  grayDark: '#1f2c3e',
};

export const darkColors = {
  primary: '#4a8fc7',
  primaryDark: '#5fa3d8',
  secondary: '#8b5fc7',
  secondaryDark: '#a573d8',
  
  background: '#1a1f2e',
  backgroundSecondary: '#2a3441',
  backgroundTertiary: '#3a4556',
  
  text: '#ffffff',
  textSecondary: '#adceed',
  textTertiary: '#99add0',
  textQuaternary: '#99afc2',
  
  border: '#3a4556',
  borderLight: '#4a5568',
  separator: '#3a4556',
  
  success: '#4ade80',
  successDark: '#22c55e',
  warning: '#fbbf24',
  warningDark: '#f59e0b',
  error: '#f87171',
  errorDark: '#ef4444',
  info: '#60a5fa',
  
  overlay: 'rgba(0,0,0,0.7)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  
  white: '#ffffff',
  black: '#000000',
  gray: '#9fb1c7',
  grayLight: '#4a5568',
  grayDark: '#d1d9e6',
};

export type Colors = typeof lightColors;

export const statusColors = {
  success: 'success',
  warning: 'warning', 
  error: 'error',
  info: 'info',
} as const;

export type StatusColor = keyof typeof statusColors;
