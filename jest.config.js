module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-redux|react-navigation|@react-navigation|react-native-reanimated|@shopify/flash-list|react-native-worklets|react-native-gesture-handler|@react-native-async-storage|redux-persist|immer|react-native-config|react-native-toast-message|lucide-react-native|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__tests__/mocks/fileMock.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/',
  ],
};
