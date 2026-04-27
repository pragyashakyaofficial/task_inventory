/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, persistor } from './src/store';
import { RootNavController } from './src/navigation/RootNavController';
import { ThemeProvider } from './src/theme/ThemeContext';
import Toast from 'react-native-toast-message';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
          <SafeAreaProvider>
            <ThemeProvider>
              <RootNavController />
              <Toast />
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
