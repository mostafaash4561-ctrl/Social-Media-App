export type PostPrivacy = "public" | "following" | "only_me";

export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface Comment {
  _id: string;
  image: string;
  content: string;
  commentCreator: PostUser;
  post: string;
  parentComment: string | null;
  createdAt: string;
  likes: string[];
  repliesCount?: number;
}

export interface SharedPost {
  _id: string;
  body: string;
  image?: string;
  privacy: PostPrivacy;
  user: PostUser;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PostType {
  _id: string;
  id: string;
  body?: string;
  image?: string;
  privacy: PostPrivacy;
  user: PostUser;
  createdAt: string;
  bookmarked: boolean;
  isShare: boolean;
  sharedPost: SharedPost | null;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  topComment: Comment | null;
}
