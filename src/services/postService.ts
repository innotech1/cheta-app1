import { apiRequest } from './apiClient';
import { ApiPost, ApiComment } from './types';

export function createPost(input: {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}) {
  return apiRequest<{ post: ApiPost }>('/posts', { method: 'POST', body: input });
}

export function getPost(id: string) {
  return apiRequest<{ post: ApiPost }>(`/posts/${id}`);
}

export function deletePost(id: string) {
  return apiRequest<{ message: string }>(`/posts/${id}`, { method: 'DELETE' });
}

export function likePost(id: string) {
  return apiRequest<{ likeCount: number }>(`/posts/${id}/like`, { method: 'POST' });
}

export function unlikePost(id: string) {
  return apiRequest<{ likeCount: number }>(`/posts/${id}/like`, { method: 'DELETE' });
}

export function repost(id: string) {
  return apiRequest<{ post: ApiPost }>(`/posts/${id}/repost`, { method: 'POST' });
}

export function undoRepost(id: string) {
  return apiRequest<{ message: string }>(`/posts/${id}/repost`, { method: 'DELETE' });
}

export function getComments(postId: string, page = 1) {
  return apiRequest<{ comments: ApiComment[]; hasMore: boolean }>(
    `/posts/${postId}/comments?page=${page}`
  );
}

export function createComment(postId: string, text: string) {
  return apiRequest<{ comment: ApiComment; commentCount: number }>(
    `/posts/${postId}/comments`,
    { method: 'POST', body: { text } }
  );
}

export function deleteComment(commentId: string) {
  return apiRequest<{ message: string }>(`/comments/${commentId}`, { method: 'DELETE' });
}
