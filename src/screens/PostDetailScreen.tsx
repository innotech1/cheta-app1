import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import PostCard from '../components/PostCard';
import * as postService from '../services/postService';
import { toUiPost, timeAgo } from '../utils/formatPost';
import { ApiPost, ApiComment } from '../services/types';
import { colors, spacing, radius } from '../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'PostDetail'>;

export default function PostDetailScreen({ route }: Props) {
  const { postId } = route.params;

  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [{ post: fetchedPost }, { comments: fetchedComments }] = await Promise.all([
        postService.getPost(postId),
        postService.getComments(postId),
      ]);
      setPost(fetchedPost);
      setComments(fetchedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load post');
    }
  }, [postId]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const handleLikeToggle = async () => {
    if (!post) return;
    const wasLiked = post.likedByViewer;
    setPost({
      ...post,
      likedByViewer: !wasLiked,
      likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
    });
    try {
      if (wasLiked) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
      }
    } catch {
      setPost((prev) =>
        prev ? { ...prev, likedByViewer: wasLiked, likeCount: post.likeCount } : prev
      );
    }
  };

  const handleRepostToggle = async () => {
    if (!post) return;
    const wasReposted = post.repostedByViewer;
    setPost({
      ...post,
      repostedByViewer: !wasReposted,
      repostCount: wasReposted ? post.repostCount - 1 : post.repostCount + 1,
    });
    try {
      if (wasReposted) {
        await postService.undoRepost(post.id);
      } else {
        await postService.repost(post.id);
      }
    } catch {
      setPost((prev) =>
        prev ? { ...prev, repostedByViewer: wasReposted, repostCount: post.repostCount } : prev
      );
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    setIsPostingComment(true);
    try {
      const { comment, commentCount } = await postService.createComment(
        post.id,
        commentText.trim()
      );
      setComments((prev) => [comment, ...prev]);
      setPost({ ...post, commentCount });
      setCommentText('');
    } catch {
      // Leave the typed text in place so the user can retry
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Post not found'}</Text>
        <Pressable onPress={load} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <PostCard
            post={toUiPost(post)}
            onLikePress={handleLikeToggle}
            onRepostPress={handleRepostToggle}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.author.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.commentBody}>
              <Text style={styles.commentHeader}>
                <Text style={styles.commentName}>{item.author.displayName}</Text>{' '}
                <Text style={styles.commentTime}>· {timeAgo(item.createdAt)}</Text>
              </Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Be the first to reply.</Text>
        }
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          editable={!isPostingComment}
        />
        <Pressable
          onPress={handleAddComment}
          disabled={!commentText.trim() || isPostingComment}
          style={[
            styles.sendButton,
            (!commentText.trim() || isPostingComment) && styles.sendButtonDisabled,
          ]}
        >
          {isPostingComment ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Ionicons name="send" size={16} color={colors.accent} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  commentRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  commentAvatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    fontSize: 13,
  },
  commentName: {
    fontWeight: '700',
    color: colors.text,
  },
  commentTime: {
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
