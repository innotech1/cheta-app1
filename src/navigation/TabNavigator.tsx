import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import VideoFeedScreen from '../screens/VideoFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        // Videos is a full-bleed black screen — dark tab bar there is easier
        // on the eyes than a bright white bar butting against it.
        tabBarStyle: route.name === 'Videos' ? { backgroundColor: '#000' } : undefined,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof TabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Videos" component={VideoFeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
