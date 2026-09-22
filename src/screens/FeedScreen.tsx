import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, DrawerActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList } from '../navigation/MainNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import PostCard, { Post } from '../components/PostCard';
import { colors, spacing } from '../theme/colors';
import * as feedService from '../services/feedService';
import * as postService from '../services/postService';
import { toUiPost } from '../utils/formatPost';
import { ApiPost } from '../services/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Feed'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function FeedScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const { posts: fetched } = await feedService.getFeed();
      setPosts(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load feed');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadFeed().finally(() => setIsLoading(false));
  }, [loadFeed]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed();
    setIsRefreshing(false);
  };

  const handleLikeToggle = async (post: ApiPost) => {
    // Optimistic update — flip it locally right away, then sync with the server.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likedByViewer: !p.likedByViewer,
              likeCount: p.likedByViewer ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );
    try {
      if (post.likedByViewer) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
      }
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likedByViewer: post.likedByViewer,
                likeCount: post.likeCount,
              }
            : p
        )
      );
    }
  };

  const handleRepostToggle = async (post: ApiPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              repostedByViewer: !p.repostedByViewer,
              repostCount: p.repostedByViewer ? p.repostCount - 1 : p.repostCount + 1,
            }
          : p
      )
    );
    try {
      if (post.repostedByViewer) {
        await postService.undoRepost(post.id);
      } else {
        await postService.repost(post.id);
      }
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, repostedByViewer: post.repostedByViewer, repostCount: post.repostCount }
            : p
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Chetá</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => navigation.navigate('Conversations')}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadFeed} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => (item.repostedAt ? `${item.id}-repost-${item.repostedAt}` : item.id)}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <PostCard
              post={toUiPost(item)}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onLikePress={() => handleLikeToggle(item)}
              onRepostPress={() => handleRepostToggle(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                No posts yet. Follow people or write your first post to get your feed going.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('NewPost')}
      >
        <Ionicons name="add" size={28} color={colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.md,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
