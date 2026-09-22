import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ApiPost } from '../services/types';
import { timeAgo } from '../utils/formatPost';
import { colors, spacing, radius } from '../theme/colors';

type Props = {
  post: ApiPost;
  isActive: boolean;
  height: number;
  onLikePress: () => void;
  onRepostPress: () => void;
  onCommentPress: () => void;
};

export default function FullScreenVideoItem({
  post,
  isActive,
  height,
  onLikePress,
  onRepostPress,
  onCommentPress,
}: Props) {
  const [muted, setMuted] = useState(true);

  const player = useVideoPlayer(post.mediaUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <Pressable style={[styles.container, { height }]} onPress={() => setMuted((m) => !m)}>
      <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="cover" nativeControls={false} />

      {muted ? (
        <View style={styles.muteBadge}>
          <Ionicons name="volume-mute" size={16} color="#fff" />
        </View>
      ) : null}

      <View style={styles.rightActions}>
        <Pressable style={styles.actionButton} onPress={onLikePress} hitSlop={10}>
          <Ionicons
            name={post.likedByViewer ? 'heart' : 'heart-outline'}
            size={30}
            color={post.likedByViewer ? colors.danger : '#fff'}
          />
          <Text style={styles.actionCount}>{post.likeCount}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onCommentPress} hitSlop={10}>
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onRepostPress} hitSlop={10}>
          <Ionicons
            name="repeat"
            size={30}
            color={post.repostedByViewer ? colors.success : '#fff'}
          />
          <Text style={styles.actionCount}>{post.repostCount}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.name}>{post.author.displayName}</Text>
        <Text style={styles.handle}>
          @{post.author.username} · {timeAgo(post.createdAt)}
        </Text>
        {post.text ? <Text style={styles.caption}>{post.text}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  muteBadge: {
    position: 'absolute',
    top: spacing.xl,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    padding: spacing.xs,
  },
  rightActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 120,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: 2,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomInfo: {
    padding: spacing.md,
    paddingRight: 80,
    paddingBottom: spacing.xl,
  },
  name: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  handle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
