import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const VISIBLE_PAGE_COUNT = 5;

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number) {
  const half = Math.floor(VISIBLE_PAGE_COUNT / 2);
  const start = Math.max(0, Math.min(page - half, totalPages - VISIBLE_PAGE_COUNT));
  const end = Math.min(totalPages, start + VISIBLE_PAGE_COUNT);
  return Array.from({ length: end - start }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const buttonStyle =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:text-gray-300';

  return (
    <nav aria-label="페이지 이동" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className={cn(buttonStyle, 'text-gray-500 hover:bg-gray-100')}
      >
        <ChevronLeft size={16} />
      </button>
      {getVisiblePages(page, totalPages).map((pageIndex) => (
        <button
          key={pageIndex}
          type="button"
          aria-current={pageIndex === page ? 'page' : undefined}
          onClick={() => onPageChange(pageIndex)}
          className={cn(
            buttonStyle,
            'tabular-nums',
            pageIndex === page
              ? 'bg-gray-900 font-semibold text-white'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          {pageIndex + 1}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(buttonStyle, 'text-gray-500 hover:bg-gray-100')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
