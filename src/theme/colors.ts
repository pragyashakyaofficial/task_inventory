export const lightColors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  secondary: '#5856D6',
  secondaryDark: '#4240A3',
  
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#FFFFFF',
  
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#3C3C4399',
  textQuaternary: '#3C3C4333',
  
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  separator: '#C6C6C8',
  
  success: '#34C759',
  successDark: '#28A745',
  warning: '#FF9500',
  warningDark: '#E67E00',
  error: '#FF3B30',
  errorDark: '#D70015',
  info: '#007AFF',
  
  overlay: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  grayLight: '#C7C7CC',
  grayDark: '#636366',
};

export const darkColors = {
  primary: '#0A84FF',
  primaryDark: '#409CFF',
  secondary: '#5E5CE6',
  secondaryDark: '#8A84FF',
  
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#EBEBF599',
  textQuaternary: '#EBEBF54D',
  
  border: '#38383A',
  borderLight: '#48484A',
  separator: '#38383A',
  
  success: '#30D158',
  successDark: '#32D74B',
  warning: '#FF9F0A',
  warningDark: '#FFCC02',
  error: '#FF453A',
  errorDark: '#FF6961',
  info: '#0A84FF',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  grayLight: '#636366',
  grayDark: '#8E8E93',
};

export type Colors = typeof lightColors;

export const statusColors = {
  success: 'success',
  warning: 'warning', 
  error: 'error',
  info: 'info',
} as const;

export type StatusColor = keyof typeof statusColors;
