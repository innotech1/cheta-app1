import { apiRequest } from './apiClient';
import { ApiUser, ApiPost } from './types';

export function getUserProfile(username: string) {
  return apiRequest<{ user: ApiUser }>(`/users/${username}`);
}

export function getUserPosts(username: string) {
  return apiRequest<{ posts: ApiPost[] }>(`/users/${username}/posts`);
}

export function followUser(username: string) {
  return apiRequest<{ message: string }>(`/users/${username}/follow`, { method: 'POST' });
}

export function unfollowUser(username: string) {
  return apiRequest<{ message: string }>(`/users/${username}/follow`, { method: 'DELETE' });
}
