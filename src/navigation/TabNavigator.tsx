import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import VideoFeedScreen from '../screens/VideoFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../theme/ThemeContext';

export type TabParamList = {
  Feed: undefined;
  Search: undefined;
  Videos: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Feed: 'home-outline',
  Search: 'search-outline',
  Videos: 'play-circle-outline',
  Profile: 'person-outline',
};

export default function TabNavigator() {
  const { colors, scheme } = useTheme();
  const isDark = scheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor:
            // Videos is a full-bleed black screen, so keep the bar black there
            // in both themes. Otherwise use the theme's background color.
            route.name === 'Videos' ? '#000' : colors.background,
          borderTopColor: route.name === 'Videos' ? '#000' : colors.border,
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Videos" component={VideoFeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}