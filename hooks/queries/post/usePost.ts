import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deletePost, getPosts } from '@/api/post.api';
import { PostsParams } from '@/types/post.type';

export const POSTS_QUERY_KEY = 'posts';

export function usePostsQuery(params: PostsParams) {
  return useQuery({
    queryKey: [POSTS_QUERY_KEY, params],
    queryFn: () => getPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}
