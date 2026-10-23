import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PanelProps {
  title: string;
  description?: string;
  href?: string;
  className?: string;
  children: ReactNode;
}

export default function Panel({ title, description, href, className, children }: PanelProps) {
  return (
    <section className={cn('flex flex-col rounded-xl border border-gray-200 bg-white', className)}>
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && <span className="text-xs text-gray-400">{description}</span>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            전체 보기
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}
