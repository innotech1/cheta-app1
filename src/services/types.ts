export type ApiUser = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  isFollowing?: boolean;
};

export type ApiPost = {
  id: string;
  text: string;
  mediaUrl: string;
  mediaType: 'none' | 'image' | 'video';
  likeCount: number;
  commentCount: number;
  repostCount: number;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
  };
  likedByViewer?: boolean;
  repostedByViewer?: boolean;
  // Present only when this feed item IS a repost — describes who reposted
  // it and when. The rest of the fields (author, text, counts) always
  // describe the ORIGINAL post.
  repostedBy?: {
    id: string;
    displayName: string;
    username: string;
  };
  repostedAt?: string;
};

export type ApiComment = {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
  };
};

export type ApiNotification = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'repost';
  read: boolean;
  createdAt: string;
  post?: string;
  actor: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
  };
};

export type ApiConversation = {
  id: string;
  otherUser: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
  };
  lastMessageText: string;
  lastMessageAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  text: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string;
  };
};
