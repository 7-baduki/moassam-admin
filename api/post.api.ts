import apiClient from './axios';
import { PostsParams, PostsResponse } from '@/types/post.type';

export const getPosts = async (params: PostsParams): Promise<PostsResponse> => {
  const response = await apiClient.get<{ data: PostsResponse }>('/api/v1/admin/posts', {
    params,
  });
  return response.data.data;
};

export const deletePost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/posts/${postId}`);
};
