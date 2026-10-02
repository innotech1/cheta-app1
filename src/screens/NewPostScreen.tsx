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
  ScrollView,
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
const MAX_MEDIA = 8;

type PickedMedia = { uri: string; type: 'image' | 'video' };

export default function NewPostScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [mediaList, setMediaList] = useState<PickedMedia[]>([]);
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
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA - mediaList.length,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const picked: PickedMedia[] = result.assets.map((a) => ({
      uri: a.uri,
      type: a.type === 'video' ? 'video' : 'image',
    }));

    setError(null);
    setMediaList((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!text.trim() && mediaList.length === 0) return;
    setError(null);
    setIsSubmitting(true);
    try {
      // Upload each media asset, collect URLs
      const uploadedMedia: { mediaUrl: string; mediaType: 'image' | 'video' }[] = [];
      for (const m of mediaList) {
        const uploaded = await uploadMedia(m.uri, m.type);
        uploadedMedia.push({ mediaUrl: uploaded.url, mediaType: uploaded.mediaType });
      }

      // Send as a single post — the backend accepts either one mediaUrl
      // (legacy) or an array. Adjust the createPost payload to whatever
      // your postService supports.
      await postService.createPost({
        text: text.trim(),
        mediaUrl: uploadedMedia[0]?.mediaUrl,
        mediaType: uploadedMedia[0]?.mediaType,
      });

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

      {mediaList.length > 0 && (
        <ScrollView horizontal style={{ marginTop: spacing.sm }} showsHorizontalScrollIndicator={false}>
          {mediaList.map((m, i) => (
            <View key={i} style={styles.mediaPreviewWrap}>
              {m.type === 'video' ? (
                <InlineVideo uri={m.uri} />
              ) : (
                <Image source={{ uri: m.uri }} style={styles.imagePreview} />
              )}
              <Pressable
                style={styles.removeMediaButton}
                onPress={() => handleRemoveMedia(i)}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Pressable
          style={styles.attachButton}
          onPress={handlePickMedia}
          disabled={isSubmitting || mediaList.length >= MAX_MEDIA}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={mediaList.length >= MAX_MEDIA ? colors.textMuted : colors.primary}
          />
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ flex: 1 }} />}
        <Text style={styles.counter}>
          {mediaList.length}/{MAX_MEDIA} · {text.length}/{MAX_LENGTH}
        </Text>
      </View>

      <Pressable
        style={[
          styles.postButton,
          ((!text.trim() && mediaList.length === 0) || isSubmitting) && styles.postButtonDisabled,
        ]}
        onPress={handlePost}
        disabled={(!text.trim() && mediaList.length === 0) || isSubmitting}
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
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  input: {
    fontSize: 18,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaPreviewWrap: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  imagePreview: {
    width: 200,
    height: 200,
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
  attachButton: { padding: spacing.xs },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  counter: { color: colors.textMuted, fontSize: 13 },
  postButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  postButtonDisabled: { opacity: 0.5 },
  postButtonText: { color: colors.accent, fontWeight: '700', fontSize: 16 },
});