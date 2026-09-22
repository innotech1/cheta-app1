import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import NotificationsScreen from '../screens/NotificationsScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import NewPostScreen from '../screens/NewPostScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import { colors } from '../theme/colors';

export type MainStackParamList = {
  Tabs: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
  NewPost: undefined;
  Conversations: undefined;
  Chat: { conversationId: string; otherUserName: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
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
    </Stack.Navigator>
  );
}
