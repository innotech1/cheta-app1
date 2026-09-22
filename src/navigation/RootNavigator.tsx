import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';
import BrandedLoadingScreen from '../components/BrandedLoadingScreen';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Once we know whether the person is logged in, the native splash screen
  // (shown automatically on native builds — Expo Go shows the app icon
  // instead, see the README) can come down.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return <BrandedLoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
