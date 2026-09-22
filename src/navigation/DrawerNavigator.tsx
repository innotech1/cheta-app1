import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainNavigator from './MainNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { colors } from '../theme/colors';

export type DrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainNavigator} />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Settings', headerTintColor: colors.primary }}
      />
    </Drawer.Navigator>
  );
}
