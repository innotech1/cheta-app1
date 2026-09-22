import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useAuth } from '../context/AuthContext';
import * as conversationService from '../services/conversationService';
import { onNewMessage } from '../services/socket';
import { ApiMessage } from '../services/types';
import { colors, spacing, radius } from '../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

export default function ChatScreen({ route }: Props) {
  const { conversationId } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    const { messages: fetched } = await conversationService.getMessages(conversationId);
    setMessages(fetched);
  }, [conversationId]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  // Live incoming messages for this specific conversation
  useEffect(() => {
    return onNewMessage((message) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, message]);
    });
  }, [conversationId]);

  // Handle Media Selection & Validation
  const handlePickMedia = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission required', 'Please grant permission to access your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 100,
      quality: 1,
    });

    if (!result.canceled) {
      const newAssets = result.assets;

      const combined = [...selectedMedia, ...newAssets];
      const images = combined.filter((m) => m.type === 'image');
      const videos = combined.filter((m) => m.type === 'video');

      if (images.length > 100) {
        Alert.alert('Limit Exceeded', 'You can attach a maximum of 100 images per message.');
        return;
      }

      if (videos.length > 10) {
        Alert.alert('Limit Exceeded', 'You can attach a maximum of 10 videos per message.');
        return;
      }

      const totalImgSize = images.reduce((sum, item) => sum + (item.fileSize || 0), 0);
      const totalVidSize = videos.reduce((sum, item) => sum + (item.fileSize || 0), 0);

      const FIVE_GB = 5 * 1024 * 1024 * 1024;
      const TEN_GB = 10 * 1024 * 1024 * 1024;

      if (totalImgSize > FIVE_GB) {
        Alert.alert('Size Limit', 'Total image payload exceeds 5 GB limit.');
        return;
      }

      if (totalVidSize > TEN_GB) {
        Alert.alert('Size Limit', 'Total video payload exceeds 10 GB limit.');
        return;
      }

      setSelectedMedia(combined);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!text.trim() && selectedMedia.length === 0) || isSending) return;

    const textToSend = text.trim();
    const mediaToSend = [...selectedMedia];

    setText('');
    setSelectedMedia([]);
    setIsSending(true);

    try {
      // Pass formData/media array to conversationService.sendMessage
      const { message } = await conversationService.sendMessage(conversationId, textToSend, mediaToSend);
      setMessages((prev) => [...prev, message]);
    } catch (err: any) {
      setText(textToSend);
      setSelectedMedia(mediaToSend);
      Alert.alert('Error', err?.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const canSend = (text.trim().length > 0 || selectedMedia.length > 0) && !isSending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.sender.id === user?.id;
          return (
            <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {!!item.text && (
                  <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                    {item.text}
                  </Text>
                )}

                {/* Media Attachments Grid */}
                {item.media && item.media.length > 0 && (
                  <View style={styles.mediaGrid}>
                    {item.media.map((m, idx) => (
                      <View key={idx} style={styles.mediaFrame}>
                        {m.mediaType === 'image' ? (
                          <Image source={{ uri: m.mediaUrl }} style={styles.mediaThumbnail} />
                        ) : (
                          <View style={styles.videoBadge}>
                            <Ionicons name="play-circle" size={24} color="#FFF" />
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Say hello 👋</Text>
          </View>
        }
        contentContainerStyle={messages.length === 0 ? { flex: 1 } : undefined}
      />

      {/* Selected Media Preview Drawer */}
      {selectedMedia.length > 0 && (
        <ScrollView horizontal style={styles.previewContainer}>
          {selectedMedia.map((item, index) => (
            <View key={index} style={styles.previewWrapper}>
              <Image source={{ uri: item.uri }} style={styles.previewImage} />
              <Pressable style={styles.removeBadge} onPress={() => handleRemoveMedia(index)}>
                <Ionicons name="close" size={12} color="#FFF" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Composer Input Bar */}
      <View style={styles.composer}>
        <Pressable onPress={handlePickMedia} style={styles.attachButton}>
          <Ionicons name="attach" size={22} color={colors.primary} />
        </Pressable>

        <TextInput
          style={styles.composerInput}
          placeholder="Message..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        >
          {isSending ? (
            <ActivityIndicator color={colors.accent} size="small" />
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
  emptyText: {
    color: colors.textMuted,
  },
  bubbleRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  bubbleRowMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: {
    color: colors.accent,
    fontSize: 15,
  },
  bubbleTextTheirs: {
    color: colors.text,
    fontSize: 15,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  mediaFrame: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  previewContainer: {
    maxHeight: 80,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewWrapper: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
  },
  removeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  attachButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});