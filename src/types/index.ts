export type UserType = 'school' | 'user';

export type PostCategory = 'notice' | 'exam' | 'event' | 'holiday' | 'emergency';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  userType: UserType;
  city?: string;
  // School-specific fields
  schoolName?: string;
  address?: string;
  phone?: string;
  website?: string;
  // User-specific fields
  followingSchools?: string[];
}

export interface Post {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolPhotoUrl?: string;
  content: string;
  category: PostCategory;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  createdAt: Date;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface School {
  id: string;
  name: string;
  profilePhotoUrl?: string;
  city: string;
  address?: string;
  followers: number;
  postsCount: number;
  isFollowing?: boolean;
}
