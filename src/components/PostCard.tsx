import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import InlineVideo from './InlineVideo';

export type Post = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'none' | 'image' | 'video';
  createdAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByViewer?: boolean;
  repostedByViewer?: boolean;
  repostedByName?: string; // set when this card is showing "X reposted"
};

type Props = {
  post: Post;
  onPress?: () => void;
  onLikePress?: () => void;
  onRepostPress?: () => void;
};

export default function PostCard({ post, onPress, onLikePress, onRepostPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {post.repostedByName ? (
        <View style={styles.repostBanner}>
          <Ionicons name="repeat" size={13} color={colors.textMuted} />
          <Text style={styles.repostBannerText}>{post.repostedByName} reposted</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{post.authorName}</Text>
            <Text style={styles.handle}>@{post.authorHandle} · {post.createdAt}</Text>
          </View>

          <Text style={styles.text}>{post.text}</Text>

          {post.mediaType === 'video' && post.mediaUrl ? (
            <InlineVideo uri={post.mediaUrl} />
          ) : post.mediaType === 'image' && post.mediaUrl ? (
            <Image source={{ uri: post.mediaUrl }} style={styles.image} />
          ) : null}

          <View style={styles.actionsRow}>
            <View style={styles.action}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
              <Text style={styles.actionText}>{post.commentCount}</Text>
            </View>
            <Pressable
              style={styles.action}
              onPress={onRepostPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="repeat"
                size={17}
                color={post.repostedByViewer ? colors.success : colors.textMuted}
              />
              <Text
                style={[styles.actionText, post.repostedByViewer && { color: colors.success }]}
              >
                {post.repostCount}
              </Text>
            </Pressable>
            <Pressable
              style={styles.action}
              onPress={onLikePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={post.likedByViewer ? 'heart' : 'heart-outline'}
                size={16}
                color={post.likedByViewer ? colors.danger : colors.textMuted}
              />
              <Text style={[styles.actionText, post.likedByViewer && { color: colors.danger }]}>
                {post.likeCount}
              </Text>
            </Pressable>
            <View style={styles.action}>
              <Ionicons name="share-outline" size={16} color={colors.textMuted} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  repostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
    marginLeft: 44 + spacing.sm, // aligns with the post text, past the avatar column
  },
  repostBannerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
    marginRight: spacing.xs,
  },
  handle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
