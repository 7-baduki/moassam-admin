export type PostCategory = 'FREE' | 'MOABANG';

export interface PostsParams {
  category?: PostCategory;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface Post {
  postId: number;
  title: string;
  author: string;
  category: PostCategory;
  createdAt: string;
  viewCount: number;
}

export interface PostsResponse {
  data: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
