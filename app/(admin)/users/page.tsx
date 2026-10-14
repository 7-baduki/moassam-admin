'use client';

import { useState } from 'react';
import { CalendarDays, SearchX, UserPlus, Users } from 'lucide-react';
import Button from '@/components/common/button/Button';
import Pagination from '@/components/common/pagination/Pagination';
import StatCard from '@/components/common/stat-card/StatCard';
import {
  USER_PROVIDER_COLORS,
  USER_PROVIDER_LABELS,
  USER_STATUS_LABELS,
} from '@/constants/user-labels';
import { useUsersQuery } from '@/hooks/queries/user/useUser';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';
import { UserStatus } from '@/types/user.type';

const PAGE_SIZE = 20;
const SKELETON_ROWS = 8;

type PeriodPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' | 'CUSTOM';

const PERIOD_PRESETS: { value: Exclude<PeriodPreset, 'CUSTOM'>; label: string }[] = [
  { value: 'TODAY', label: '오늘' },
  { value: 'WEEK', label: '7일' },
  { value: 'MONTH', label: '30일' },
  { value: 'ALL', label: '전체' },
];

const STATUS_STYLES: Record<UserStatus, { badge: string; dot: string }> = {
  ACTIVE: { badge: 'bg-success-50 text-success-700', dot: 'bg-success-500' },
  WITHDRAWN: { badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

const TABLE_COLUMNS = [
  { label: '회원 ID', width: 'w-[14%]' },
  { label: '닉네임', width: 'w-[32%]' },
  { label: '가입 경로', width: 'w-[18%]' },
  { label: '가입일', width: 'w-[20%]' },
  { label: '상태', width: 'w-[16%]' },
];

interface SearchParams {
  startDate?: string;
  endDate?: string;
  page: number;
}

function getPresetRange(preset: Exclude<PeriodPreset, 'CUSTOM'>) {
  if (preset === 'ALL') {
    return { startDate: undefined, endDate: undefined };
  }
  const today = new Date();
  const start = new Date(today);
  if (preset === 'WEEK') start.setDate(today.getDate() - 6);
  if (preset === 'MONTH') start.setDate(today.getDate() - 29);
  return { startDate: formatDate(start), endDate: formatDate(today) };
}

export default function UsersPage() {
  const [preset, setPreset] = useState<PeriodPreset>('MONTH');
  const [searchParams, setSearchParams] = useState<SearchParams>(() => ({
    ...getPresetRange('MONTH'),
    page: 0,
  }));

  const { data, isPending, isError, error, isPlaceholderData, refetch } = useUsersQuery({
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    page: searchParams.page,
    size: PAGE_SIZE,
  });

  const handlePresetClick = (value: Exclude<PeriodPreset, 'CUSTOM'>) => {
    setPreset(value);
    setSearchParams({ ...getPresetRange(value), page: 0 });
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    setPreset('CUSTOM');
    setSearchParams((prev) => ({ ...prev, [key]: value || undefined, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const users = data?.users;

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="mt-1 text-sm text-gray-500">가입 기간별로 회원을 조회합니다.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="조회 기간"
            className="flex rounded-lg border border-gray-200 bg-white p-0.5"
          >
            {PERIOD_PRESETS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={preset === value}
                onClick={() => handlePresetClick(value)}
                className={cn(
                  'h-8 rounded-md px-3 text-sm font-medium transition-colors',
                  preset === value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm',
              preset === 'CUSTOM' ? 'border-gray-900' : 'border-gray-200',
            )}
          >
            <CalendarDays size={16} className="shrink-0 text-gray-400" />
            <input
              type="date"
              aria-label="가입 시작일"
              value={searchParams.startDate ?? ''}
              max={searchParams.endDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="bg-transparent text-gray-700 outline-none"
            />
            <span className="text-gray-300">~</span>
            <input
              type="date"
              aria-label="가입 종료일"
              value={searchParams.endDate ?? ''}
              min={searchParams.startDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="bg-transparent text-gray-700 outline-none"
            />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          label="전체 회원"
          value={data ? data.totalUserCount.toLocaleString() : '-'}
          description="누적"
          icon={Users}
        />
        <StatCard
          label="기간 가입자"
          value={data ? data.periodUserCount.toLocaleString() : '-'}
          icon={UserPlus}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">회원 목록</h2>
          {users && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 tabular-nums">
              {users.totalElements.toLocaleString()}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-sm">
            <thead className="border-y border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                {TABLE_COLUMNS.map(({ label, width }) => (
                  <th key={label} className={cn('px-5 py-2.5 font-medium', width)}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={cn(
                'divide-y divide-gray-100 transition-opacity',
                isPlaceholderData && 'opacity-50',
              )}
            >
              {isPending ? (
                Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <tr key={index}>
                    {TABLE_COLUMNS.map(({ label }) => (
                      <td key={label} className="px-5 py-4">
                        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length} className="px-5 py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <p className="text-sm text-danger-700">{getErrorMessage(error)}</p>
                      <Button variant="secondary" className="h-9" onClick={() => refetch()}>
                        다시 시도
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : data.users.data.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length} className="px-5 py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <SearchX size={32} className="text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          해당 기간에 가입한 회원이 없습니다.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">조회 기간을 넓혀 보세요.</p>
                      </div>
                      {preset !== 'ALL' && (
                        <Button
                          variant="secondary"
                          className="h-9"
                          onClick={() => handlePresetClick('ALL')}
                        >
                          전체 기간 보기
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.users.data.map((user) => {
                  const isWithdrawn = user.status === 'WITHDRAWN';
                  const [date, time] = user.createdAt.split('T');
                  return (
                    <tr
                      key={user.userId}
                      className={cn(
                        'transition-colors hover:bg-gray-50',
                        isWithdrawn && 'text-gray-400',
                      )}
                    >
                      <td className="px-5 py-3 text-gray-400 tabular-nums">{user.userId}</td>
                      <td
                        className={cn(
                          'truncate px-5 py-3 font-medium',
                          !isWithdrawn && 'text-gray-900',
                        )}
                      >
                        {user.nickname}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: USER_PROVIDER_COLORS[user.provider] ?? '#a1a1aa',
                            }}
                          />
                          <span className={cn(!isWithdrawn && 'text-gray-700')}>
                            {USER_PROVIDER_LABELS[user.provider] ?? user.provider}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3 tabular-nums">
                        <div className={cn(!isWithdrawn && 'text-gray-900')}>{date}</div>
                        <div className="text-xs text-gray-400">{time?.slice(0, 5)}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                            STATUS_STYLES[user.status].badge,
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              STATUS_STYLES[user.status].dot,
                            )}
                          />
                          {USER_STATUS_LABELS[user.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {users && users.totalPages > 1 && (
          <div className="flex justify-center border-t border-gray-200 px-5 py-3">
            <Pagination
              page={users.page}
              totalPages={users.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}
