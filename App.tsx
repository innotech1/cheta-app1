// Must be the very first import in the entire app — react-native-gesture-handler
// requires this, and it must run before anything else touches native modules.
import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Keep the native splash screen up until RootNavigator explicitly hides it
// (once we know whether the person is logged in). Must be called at module
// scope, not inside a component — see expo-splash-screen's docs.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    // Required by both react-native-gesture-handler and the drawer navigator —
    // must wrap the whole app, as close to the root as possible.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
