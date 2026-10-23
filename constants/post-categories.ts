import { PostCategory } from '@/types/post.type';

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  FREE: '자유게시판',
  MOABANG: '모아방',
};

export const POST_CATEGORIES: PostCategory[] = ['FREE', 'MOABANG'];

export const POST_CATEGORY_COLORS: Record<PostCategory, string> = {
  FREE: 'var(--color-primary-600)',
  MOABANG: 'var(--color-primary-200)',
};
