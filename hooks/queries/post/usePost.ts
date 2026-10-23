import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { deletePost, getPosts } from '@/api/post.api';
import { POST_CATEGORIES } from '@/constants/post-categories';
import { PostsParams } from '@/types/post.type';

export const POSTS_QUERY_KEY = 'posts';

export function usePostsQuery(params: PostsParams) {
  return useQuery({
    queryKey: [POSTS_QUERY_KEY, params],
    queryFn: () => getPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function usePostCategoryCountsQuery() {
  return useQueries({
    queries: POST_CATEGORIES.map((category) => {
      const params: PostsParams = { category, page: 0, size: 1 };
      return {
        queryKey: [POSTS_QUERY_KEY, params],
        queryFn: () => getPosts(params),
      };
    }),
    combine: (results) => ({
      counts: POST_CATEGORIES.map((category, index) => ({
        category,
        count: results[index].data?.totalElements ?? 0,
      })),
      isPending: results.some((result) => result.isPending),
      error: results.find((result) => result.error)?.error ?? null,
    }),
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
