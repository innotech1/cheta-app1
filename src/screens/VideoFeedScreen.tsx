import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList } from '../navigation/MainNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import FullScreenVideoItem from '../components/FullScreenVideoItem';
import * as videoService from '../services/videoService';
import { likePost, unlikePost, repost, undoRepost } from '../services/postService';
import { ApiPost } from '../services/types';
import { colors } from '../theme/colors';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Videos'>,
  NativeStackScreenProps<MainStackParamList>
>;

export default function VideoFeedScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const page = useRef(1);
  const hasMore = useRef(true);

  const load = useCallback(async () => {
    try {
      const { posts: fetched, hasMore: more } = await videoService.getVideoFeed(1);
      setPosts(fetched);
      page.current = 1;
      hasMore.current = more;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load videos');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const loadMore = async () => {
    if (!hasMore.current) return;
    try {
      const next = page.current + 1;
      const { posts: fetched, hasMore: more } = await videoService.getVideoFeed(next);
      if (fetched.length) {
        setPosts((prev) => [...prev, ...fetched]);
        page.current = next;
      }
      hasMore.current = more;
    } catch {
      // Silently stop paginating on error — what's already loaded stays usable
      hasMore.current = false;
    }
  };

  const updatePost = (id: string, patch: Partial<ApiPost>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleLike = async (post: ApiPost) => {
    const was = post.likedByViewer;
    updatePost(post.id, { likedByViewer: !was, likeCount: was ? post.likeCount - 1 : post.likeCount + 1 });
    try {
      was ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      updatePost(post.id, { likedByViewer: was, likeCount: post.likeCount });
    }
  };

  const handleRepost = async (post: ApiPost) => {
    const was = post.repostedByViewer;
    updatePost(post.id, {
      repostedByViewer: !was,
      repostCount: was ? post.repostCount - 1 : post.repostCount + 1,
    });
    try {
      was ? await undoRepost(post.id) : await repost(post.id);
    } catch {
      updatePost(post.id, { repostedByViewer: was, repostCount: post.repostCount });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" size="large" />
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
    <View
      style={styles.container}
      onLayout={(e) => setItemHeight(e.nativeEvent.layout.height)}
    >
      {itemHeight > 0 && posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          onEndReached={loadMore}
          onEndReachedThreshold={2}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          renderItem={({ item, index }) => (
            <FullScreenVideoItem
              post={item}
              isActive={index === activeIndex}
              height={itemHeight}
              onLikePress={() => handleLike(item)}
              onRepostPress={() => handleRepost(item)}
              onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            />
          )}
        />
      ) : posts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No videos yet — be the first to post one.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  retryText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
