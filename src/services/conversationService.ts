import { ImagePickerAsset } from 'expo-image-picker';
import { apiRequest } from './apiClient';
import { ApiConversation, ApiMessage } from './types';

export function getConversations() {
  return apiRequest<{ conversations: ApiConversation[] }>('/conversations');
}

export function getOrCreateConversation(username: string) {
  return apiRequest<{ conversation: ApiConversation }>('/conversations', {
    method: 'POST',
    body: { username },
  });
}

export function getMessages(conversationId: string, page = 1) {
  return apiRequest<{ messages: ApiMessage[]; hasMore: boolean }>(
    `/conversations/${conversationId}/messages?page=${page}`
  );
}

export function sendMessage(
  conversationId: string,
  text: string,
  mediaAssets: ImagePickerAsset[] = []
) {
  if (mediaAssets.length > 0) {
    const formData = new FormData();
    formData.append('text', text);

    mediaAssets.forEach((file, index) => {
      const ext = file.uri.split('.').pop() || 'jpg';
      const isVideo = file.type === 'video';

      formData.append('media', {
        uri: file.uri,
        name: `msg_media_${index}_${Date.now()}.${ext}`,
        type: isVideo ? `video/${ext}` : `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      } as any);
    });

    return apiRequest<{ message: ApiMessage }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  return apiRequest<{ message: ApiMessage }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { text },
  });
}