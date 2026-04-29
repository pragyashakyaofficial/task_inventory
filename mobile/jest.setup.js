import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-config', () => ({
  APP_NAME: 'InventoryAppTest',
  API_BASE_URL: 'https://api.test.com',
  ENVIRONMENT: 'development',
  DEBUG_MODE: 'false',
  LOG_LEVEL: 'debug',
  API_TIMEOUT: '10000',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: View,
      Text: Text,
      createAnimatedComponent: (Component) => Component,
      addWhitelistedNativeProps: jest.fn(),
      addWhitelistedUIProps: jest.fn(),
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (cb) => cb(),
    withSpring: (v) => v,
    withTiming: (v) => v,
    runOnJS: (fn) => fn,
    Easing: {
      out: () => (v) => v,
      exp: () => (v) => v,
      linear: (v) => v,
      bezier: () => (v) => v,
    },
    useDerivedValue: (cb) => ({ value: cb() }),
    FadeInDown: {
      delay: () => ({
        springify: () => ({}),
      }),
    },
    Layout: {
      springify: () => ({}),
    },
    createAnimatedComponent: (Component) => Component,
    withDelay: (d, v) => v,
    withRepeat: (v) => v,
    withSequence: (...args) => args[0],
    cancelAnimation: jest.fn(),
    measure: jest.fn(),
    scrollTo: jest.fn(),
    useAnimatedGestureHandler: () => ({}),
    useAnimatedScrollHandler: () => ({}),
    Extrapolate: { CLAMP: 'clamp' },
    interpolate: (v, i, o) => v,
    makeMutable: (v) => ({ value: v }),
    runOnUI: (fn) => fn,
  };
});

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  init: jest.fn(),
}));

jest.mock('@shopify/flash-list', () => {
  const { FlatList } = require('react-native');
  return {
    FlashList: FlatList,
  };
});
