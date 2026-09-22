import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import * as conversationService from '../services/conversationService';
import { onNewMessage } from '../services/socket';
import { timeAgo } from '../utils/formatPost';
import { ApiConversation } from '../services/types';
import { colors, spacing, radius } from '../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Conversations'>;

export default function ConversationsScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { conversations: fetched } = await conversationService.getConversations();
      setConversations(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  // Refresh whenever this screen comes back into focus — e.g. returning from
  // a chat after sending a message, so the preview/order reflects it right
  // away rather than waiting for the next pull-to-refresh.
  useEffect(() => {
    return navigation.addListener('focus', load);
  }, [navigation, load]);

  // Bump a conversation to the top and update its preview whenever a message
  // arrives in real time, without waiting for a manual refresh.
  useEffect(() => {
    return onNewMessage((message) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversationId);
        if (idx === -1) {
          // Message in a conversation we don't have loaded yet — just refetch the list.
          load();
          return prev;
        }
        const updated = {
          ...prev[idx],
          lastMessageText: message.text,
          lastMessageAt: message.createdAt,
        };
        const rest = prev.filter((_, i) => i !== idx);
        return [updated, ...rest];
      });
    });
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={load} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                otherUserName: item.otherUser.displayName,
              })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.otherUser.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.otherUser.displayName}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessageText || 'Say hello 👋'}
              </Text>
            </View>
            <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No conversations yet. Message someone from search to start one.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  retryText: {
    color: colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 18,
  },
  rowBody: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  preview: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
