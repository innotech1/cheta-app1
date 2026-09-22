import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import * as postService from '../services/postService';
import { uploadMedia } from '../services/mediaService';
import InlineVideo from '../components/InlineVideo';
import { colors, spacing, radius } from '../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'NewPost'>;

const MAX_LENGTH = 500;

type PickedMedia = {
  uri: string;
  type: 'image' | 'video';
};

export default function NewPostScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo/video library permission is needed to attach media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setError(null);
    setMedia({
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
    });
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      if (media) {
        const uploaded = await uploadMedia(media.uri, media.type);
        mediaUrl = uploaded.url;
        mediaType = uploaded.mediaType;
      }

      await postService.createPost({ text: text.trim(), mediaUrl, mediaType });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TextInput
        style={styles.input}
        placeholder="What's happening?"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        autoFocus
        maxLength={MAX_LENGTH}
        editable={!isSubmitting}
      />

      {media ? (
        <View style={styles.mediaPreviewWrap}>
          {media.type === 'video' ? (
            <InlineVideo uri={media.uri} />
          ) : (
            <Image source={{ uri: media.uri }} style={styles.imagePreview} />
          )}
          <Pressable
            style={styles.removeMediaButton}
            onPress={() => setMedia(null)}
            disabled={isSubmitting}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          style={styles.attachButton}
          onPress={handlePickMedia}
          disabled={isSubmitting || !!media}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={media ? colors.textMuted : colors.primary}
          />
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ flex: 1 }} />}
        <Text style={styles.counter}>
          {text.length}/{MAX_LENGTH}
        </Text>
      </View>

      <Pressable
        style={[
          styles.postButton,
          (!text.trim() || isSubmitting) && styles.postButtonDisabled,
        ]}
        onPress={handlePost}
        disabled={!text.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={styles.postButtonText}>Post</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  input: {
    fontSize: 18,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaPreviewWrap: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  removeMediaButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  attachButton: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
  },
  counter: {
    color: colors.textMuted,
    fontSize: 13,
  },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
});
