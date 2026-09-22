import React from 'react';
import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, radius } from '../theme/colors';

type Props = {
  uri: string;
};

// A standalone component (not inline logic in PostCard) because
// useVideoPlayer is a hook — it needs its own component so it's only
// called when a post actually has video, keeping hook rules happy.
export default function InlineVideo({ uri }: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      nativeControls
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    borderRadius: radius.sm,
    marginTop: 8,
    backgroundColor: colors.backgroundDark,
  },
});
