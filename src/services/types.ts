// src/services/types.ts

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

// ---------- Marketplace types ----------

export type ApiListingAuthor = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

export type ApiListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  negotiable: boolean;
  category:
    | 'electronics'
    | 'fashion'
    | 'home'
    | 'vehicles'
    | 'property'
    | 'services'
    | 'jobs'
    | 'other';
  condition: 'new' | 'used' | 'refurbished' | 'not_applicable';
  images: string[];
  location: string;
  status: 'active' | 'sold' | 'archived';
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  author: ApiListingAuthor | null;
};

export type ListingCategory = ApiListing['category'];
export type ListingCondition = ApiListing['condition'];
export type ListingStatus = ApiListing['status'];