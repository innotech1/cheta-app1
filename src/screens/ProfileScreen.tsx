import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import * as userService from '../services/userService';
import * as postService from '../services/postService';
import { toUiPost } from '../utils/formatPost';
import { ApiPost } from '../services/types';
import { colors, spacing, radius } from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { posts: fetched } = await userService.getUserPosts(user.username);
    setPosts(fetched);
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleLikeToggle = async (post: ApiPost) => {
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
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, ...post } : p))
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
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...post } : p)));
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.cover} />

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.handle}>@{user.username}</Text>
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user.followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => (item.repostedAt ? `${item.id}-repost-${item.repostedAt}` : item.id)}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <PostCard
              post={toUiPost(item)}
              onLikePress={() => handleLikeToggle(item)}
              onRepostPress={() => handleRepostToggle(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't posted anything yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cover: {
    height: 120,
    backgroundColor: colors.primary,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 28,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
    color: colors.text,
  },
  handle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  signOutButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
  },
  signOutText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
