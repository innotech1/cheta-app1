import { ApiPost } from '../services/types';
import { Post } from '../components/PostCard';

export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(isoDate).toLocaleDateString();
}

export function toUiPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id,
    authorName: apiPost.author.displayName,
    authorHandle: apiPost.author.username,
    authorAvatar: apiPost.author.avatarUrl,
    text: apiPost.text,
    mediaUrl: apiPost.mediaUrl || undefined,
    mediaType: apiPost.mediaType,
    createdAt: timeAgo(apiPost.createdAt),
    likeCount: apiPost.likeCount,
    commentCount: apiPost.commentCount,
    repostCount: apiPost.repostCount,
    likedByViewer: apiPost.likedByViewer,
    repostedByViewer: apiPost.repostedByViewer,
    repostedByName: apiPost.repostedBy?.displayName,
  };
}
