import { ImagePickerAsset } from 'expo-image-picker';
import { File } from 'expo-file-system';
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
    if (text) formData.append('text', text);

    mediaAssets.forEach((asset, index) => {
      const ext =
        asset.uri.split('.').pop()?.toLowerCase() ||
        (asset.type === 'video' ? 'mp4' : 'jpg');
      const name = `msg_media_${index}_${Date.now()}.${ext}`;
      // SDK 57's fetch requires a Blob-compatible part.
      // expo-file-system's File class satisfies this.
      const file = new File(asset.uri);
      formData.append('media', file, name);
    });

    return apiRequest<{ message: ApiMessage }>(
      `/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  return apiRequest<{ message: ApiMessage }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { text },
  });
}