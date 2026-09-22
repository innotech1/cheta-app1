import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import * as notificationService from '../services/notificationService';
import { timeAgo } from '../utils/formatPost';
import { ApiNotification } from '../services/types';
import { colors, spacing } from '../theme/colors';

const VERB: Record<ApiNotification['type'], string> = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
  repost: 'reposted your post',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { notifications: fetched } = await notificationService.getNotifications();
      setNotifications(fetched);
      notificationService.markAllAsRead().catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
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
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <View style={[styles.row, !item.read && styles.unreadRow]}>
            <Text style={styles.message}>
              <Text style={styles.actorName}>{item.actor.displayName}</Text>{' '}
              {VERB[item.type]}
            </Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No notifications yet. Likes, comments, and new followers will show up here.
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadRow: {
    backgroundColor: '#FBF7FA',
  },
  message: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  actorName: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
