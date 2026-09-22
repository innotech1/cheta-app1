import { apiRequest } from './apiClient';
import { ApiPost } from './types';

export function getFeed(page = 1) {
  return apiRequest<{ posts: ApiPost[]; hasMore: boolean }>(`/feed?page=${page}`);
}
