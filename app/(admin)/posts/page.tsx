'use client';

import { SyntheticEvent, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import { POST_CATEGORIES, POST_CATEGORY_LABELS } from '@/constants/post-categories';
import { useDeletePostMutation, usePostsQuery } from '@/hooks/queries/post/usePost';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { PostCategory } from '@/types/post.type';

const PAGE_SIZE = 20;

interface SearchParams {
  category?: PostCategory;
  keyword?: string;
  page: number;
}

function formatDateTime(value: string) {
  return value.replace('T', ' ').slice(0, 16);
}

export default function PostsPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({ page: 0 });
  const [categoryInput, setCategoryInput] = useState<PostCategory | ''>('');
  const [keywordInput, setKeywordInput] = useState('');

  const { data, isPending, isError, error } = usePostsQuery({
    category: searchParams.category,
    keyword: searchParams.keyword,
    page: searchParams.page,
    size: PAGE_SIZE,
  });

  const { mutate: removePost, isPending: isDeleting } = useDeletePostMutation();

  const handleSearch = (e: SyntheticEvent) => {
    e.preventDefault();
    setSearchParams({
      category: categoryInput || undefined,
      keyword: keywordInput.trim() || undefined,
      page: 0,
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleDelete = (postId: number, title: string) => {
    if (!window.confirm(`'${title}' 게시글을 삭제하시겠습니까?`)) {
      return;
    }
    removePost(postId, {
      onError: (err) => window.alert(getErrorMessage(err)),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
        <p className="mt-1 text-sm text-gray-500">
          게시글 목록을 조회하고 부적절한 게시글을 삭제합니다.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">카테고리</span>
          <div className="relative">
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value as PostCategory | '')}
              className="h-11 w-40 appearance-none rounded-lg border border-gray-300 bg-gray-50 pr-10 pl-3 text-sm text-gray-900 outline-none focus:border-primary-500"
            >
              <option value="">전체</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {POST_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            />
          </div>
        </label>

        <div className="w-64">
          <Input
            label="검색어"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="제목 키워드 또는 작성자"
          />
        </div>

        <Button type="submit" className="px-6">
          검색
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">번호</th>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">작성자</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">작성일</th>
              <th className="px-4 py-3 font-medium">조회수</th>
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isPending ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-danger-700">
                  {getErrorMessage(error)}
                </td>
              </tr>
            ) : data.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              data.data.map((post) => (
                <tr key={post.postId} className="text-gray-900">
                  <td className="px-4 py-3 text-gray-500">{post.postId}</td>
                  <td className="px-4 py-3">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{POST_CATEGORY_LABELS[post.category]}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(post.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{post.viewCount}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(post.postId, post.title)}
                      disabled={isDeleting}
                      className="h-9 px-3 text-danger-700"
                    >
                      삭제
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            className="h-9 px-3"
            disabled={data.page === 0}
            onClick={() => handlePageChange(data.page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {data.page + 1} / {data.totalPages}
          </span>
          <Button
            variant="secondary"
            className="h-9 px-3"
            disabled={!data.hasNext}
            onClick={() => handlePageChange(data.page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
