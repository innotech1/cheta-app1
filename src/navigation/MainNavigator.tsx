import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import NewPostScreen from '../screens/NewPostScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { useTheme } from '../theme/ThemeContext';

export type MainStackParamList = {
  Tabs: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  NewPost: undefined;
  Conversations: undefined;
  Chat: { conversationId: string; otherUserName: string };
  // Marketplace
  Marketplace: undefined;
  ListingDetail: { listingId: string };
  CreateListing: undefined;
  EditListing: { listingId: string };
  MyListings: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <Stack.Screen
        name="NewPost"
        component={NewPostScreen}
        options={{ title: 'New post', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params.otherUserName })}
      />

      {/* Marketplace */}
      <Stack.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Listing' }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ title: 'New listing', presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditListing"
        component={CreateListingScreen}
        options={{ title: 'Edit listing', presentation: 'modal' }}
      />
      <Stack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{ title: 'My listings' }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Saved' }}
      />
    </Stack.Navigator>
  );
}