import { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  description?: ReactNode;
  icon: LucideIcon;
  isUpdating?: boolean;
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  isUpdating = false,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl font-bold text-gray-900 tabular-nums transition-opacity',
              isUpdating && 'opacity-30',
            )}
          >
            {value}
          </span>
          {description && <span className="truncate text-xs text-gray-400">{description}</span>}
        </div>
      </div>
    </div>
  );
}
