import { apiRequest } from './apiClient';
import { ApiPost } from './types';

export function getVideoFeed(page = 1) {
  return apiRequest<{ posts: ApiPost[]; hasMore: boolean }>(`/videos?page=${page}`);
}
