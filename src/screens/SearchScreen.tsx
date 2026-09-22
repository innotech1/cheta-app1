import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList } from '../navigation/MainNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import PostCard from '../components/PostCard';
import * as searchService from '../services/searchService';
import * as userService from '../services/userService';
import * as conversationService from '../services/conversationService';
import { likePost, unlikePost, repost as repostFn, undoRepost } from '../services/postService';
import { toUiPost } from '../utils/formatPost';
import { SearchUser } from '../services/searchService';
import { ApiPost } from '../services/types';
import { colors, spacing, radius } from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Search'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Debounce: wait 400ms after typing stops before hitting the API
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      setPosts([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchService.search(trimmed);
        setUsers(results.users);
        setPosts(results.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

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
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
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
        await undoRepost(post.id);
      } else {
        await repostFn(post.id);
      }
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    }
  };

  const handleFollowToggle = async (user: SearchUser) => {
    const isFollowing = followingUsernames.has(user.username);
    setFollowingUsernames((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(user.username) : next.add(user.username);
      return next;
    });
    try {
      if (isFollowing) {
        await userService.unfollowUser(user.username);
      } else {
        await userService.followUser(user.username);
      }
    } catch {
      setFollowingUsernames((prev) => {
        const next = new Set(prev);
        isFollowing ? next.add(user.username) : next.delete(user.username);
        return next;
      });
    }
  };

  const handleMessagePress = async (user: SearchUser) => {
    try {
      const { conversation } = await conversationService.getOrCreateConversation(user.username);
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUserName: user.displayName,
      });
    } catch {
      // Silently fail — the person can just try tapping again
    }
  };

  const showResults = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search people or posts"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>

      {!showResults ? (
        <Text style={styles.empty}>Search for people, posts, or topics</Text>
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : (
        <FlatList
          data={[
            ...(users.length ? [{ type: 'usersHeader' as const }] : []),
            ...users.map((u) => ({ type: 'user' as const, user: u })),
            ...(posts.length ? [{ type: 'postsHeader' as const }] : []),
            ...posts.map((p) => ({ type: 'post' as const, post: p })),
          ]}
          keyExtractor={(item, i) =>
            item.type === 'user'
              ? `u-${item.user.id}`
              : item.type === 'post'
              ? `p-${item.post.id}`
              : `${item.type}-${i}`
          }
          renderItem={({ item }) => {
            if (item.type === 'usersHeader') {
              return <Text style={styles.sectionHeader}>People</Text>;
            }
            if (item.type === 'postsHeader') {
              return <Text style={styles.sectionHeader}>Posts</Text>;
            }
            if (item.type === 'user') {
              const isFollowing = followingUsernames.has(item.user.username);
              return (
                <View style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user.displayName}</Text>
                    <Text style={styles.userHandle}>@{item.user.username}</Text>
                  </View>
                  <Pressable
                    style={styles.messageButton}
                    onPress={() => handleMessagePress(item.user)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="mail-outline" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                    onPress={() => handleFollowToggle(item.user)}
                  >
                    <Text
                      style={[
                        styles.followButtonText,
                        isFollowing && styles.followingButtonText,
                      ]}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </Pressable>
                </View>
              );
            }
            return (
              <PostCard
                post={toUiPost(item.post)}
                onPress={() => navigation.navigate('PostDetail', { postId: item.post.id })}
                onLikePress={() => handleLikeToggle(item.post)}
                onRepostPress={() => handleRepostToggle(item.post)}
              />
            );
          }}
          ListEmptyComponent={
            !isSearching ? <Text style={styles.empty}>No results for "{query}"</Text> : null
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    margin: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    color: colors.accent,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
  },
  userHandle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  followButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  messageButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  followingButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.text,
  },
});
