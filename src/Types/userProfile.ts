export type Gender = "male" | "female";

export interface UserProfile {
  _id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover: string | null;
  gender: Gender;
  dateOfBirth: string;
  createdAt: string;
  bookmarks: string[];
  bookmarksCount: number;
  followers: string[];
  followersCount: number;
  following: string[];
  followingCount: number;
}

export type PublicUser = Partial<UserProfile> & Pick<UserProfile, "_id" | "name">;
