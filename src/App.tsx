// Must be the very first import in the entire app — react-native-gesture-handler
// requires this, and it must run before anything else touches native modules.
import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import RootNavigator from './navigation/RootNavigator';

// Keep the native splash screen up until RootNavigator explicitly hides it
// (once we know whether the person is logged in). Must be called at module
// scope, not inside a component — see expo-splash-screen's docs.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Separate component so it can call useTheme() — hooks only work
// inside the provider that supplies them.
function AppInner() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    // Required by both react-native-gesture-handler and the drawer navigator —
    // must wrap the whole app, as close to the root as possible.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* initialMetrics gives us the correct inset values on the very first
          render, preventing a 1-frame flash where content sits under the
          status bar before SafeAreaProvider has measured the device. */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <AuthProvider>
            <AppInner />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}