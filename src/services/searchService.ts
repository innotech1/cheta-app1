import { apiRequest } from './apiClient';
import { ApiPost } from './types';

export type SearchUser = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
};

export function search(query: string) {
  return apiRequest<{ users: SearchUser[]; posts: ApiPost[] }>(
    `/search?q=${encodeURIComponent(query)}`
  );
}
