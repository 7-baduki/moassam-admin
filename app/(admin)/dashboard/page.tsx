'use client';

import { FileText, UserMinus, UserPlus, Users } from 'lucide-react';
import SignupChart from '@/components/common/chart/SignupChart';
import Panel from '@/components/common/panel/Panel';
import RatioBar from '@/components/common/ratio-bar/RatioBar';
import StatCard from '@/components/common/stat-card/StatCard';
import { POST_CATEGORY_COLORS, POST_CATEGORY_LABELS } from '@/constants/post-categories';
import { USER_PROVIDER_COLORS, USER_PROVIDER_LABELS } from '@/constants/user-labels';
import { usePostCategoryCountsQuery, usePostsQuery } from '@/hooks/queries/post/usePost';
import { useUserStatisticsQuery } from '@/hooks/queries/user/useUser';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cn } from '@/utils/cn';

const RECENT_COUNT = 5;
const SIGNUP_DAYS = 30;

function formatShortDateTime(value: string) {
  return value.slice(5, 16).replace('-', '.').replace('T', ' ');
}

function formatSignupDiff(current: number, previous: number) {
  const diff = current - previous;
  if (diff === 0) return `지난 ${SIGNUP_DAYS}일과 같음`;
  return `지난 ${SIGNUP_DAYS}일보다 ${diff > 0 ? '+' : ''}${diff.toLocaleString()}`;
}

function ListSkeleton({ rows = RECENT_COUNT }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-4 pt-1">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="h-4 w-full animate-pulse rounded bg-gray-100" />
      ))}
    </ul>
  );
}

function PanelMessage({ children, isError = false }: { children: string; isError?: boolean }) {
  return (
    <p className={cn('py-6 text-center text-sm', isError ? 'text-danger-700' : 'text-gray-400')}>
      {children}
    </p>
  );
}

export default function DashboardPage() {
  const userStatistics = useUserStatisticsQuery(SIGNUP_DAYS);
  const recentPosts = usePostsQuery({ page: 0, size: RECENT_COUNT });
  const categoryCounts = usePostCategoryCountsQuery();

  const statistics = userStatistics.data;
  const totalPostCount = categoryCounts.counts.reduce((sum, { count }) => sum + count, 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">서비스 현황을 한눈에 확인합니다.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="전체 회원"
          value={statistics ? statistics.totalUserCount.toLocaleString() : '-'}
          description="누적"
          icon={Users}
        />
        <StatCard
          label={`최근 ${SIGNUP_DAYS}일 가입`}
          value={statistics ? statistics.recentSignupCount.toLocaleString() : '-'}
          description={
            statistics
              ? formatSignupDiff(statistics.recentSignupCount, statistics.previousSignupCount)
              : undefined
          }
          icon={UserPlus}
        />
        <StatCard
          label="탈퇴 회원"
          value={statistics ? statistics.withdrawnUserCount.toLocaleString() : '-'}
          description="누적"
          icon={UserMinus}
        />
        <StatCard
          label="전체 게시글"
          value={
            categoryCounts.isPending || categoryCounts.error ? '-' : totalPostCount.toLocaleString()
          }
          description="누적"
          icon={FileText}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="가입 추이"
          description={`최근 ${SIGNUP_DAYS}일 · 일별`}
          className="lg:col-span-2"
        >
          {userStatistics.isPending ? (
            <div className="h-[260px] animate-pulse rounded-lg bg-gray-50" />
          ) : userStatistics.isError ? (
            <PanelMessage isError>{getErrorMessage(userStatistics.error)}</PanelMessage>
          ) : (
            <SignupChart data={userStatistics.data.dailySignups} />
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="가입 경로" description="누적">
            {userStatistics.isPending ? (
              <ListSkeleton rows={3} />
            ) : userStatistics.isError ? (
              <PanelMessage isError>{getErrorMessage(userStatistics.error)}</PanelMessage>
            ) : (
              <RatioBar
                unit="명"
                items={userStatistics.data.providerCounts.map(({ provider, count }) => ({
                  key: provider,
                  label: USER_PROVIDER_LABELS[provider] ?? provider,
                  count,
                  color: USER_PROVIDER_COLORS[provider] ?? '#a1a1aa',
                }))}
              />
            )}
          </Panel>

          <Panel title="카테고리별 게시글" description="누적">
            {categoryCounts.isPending ? (
              <ListSkeleton rows={3} />
            ) : categoryCounts.error ? (
              <PanelMessage isError>{getErrorMessage(categoryCounts.error)}</PanelMessage>
            ) : (
              <RatioBar
                items={categoryCounts.counts.map(({ category, count }) => ({
                  key: category,
                  label: POST_CATEGORY_LABELS[category],
                  count,
                  color: POST_CATEGORY_COLORS[category],
                }))}
              />
            )}
          </Panel>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="최근 가입 회원" href="/users">
          {userStatistics.isPending ? (
            <ListSkeleton />
          ) : userStatistics.isError ? (
            <PanelMessage isError>{getErrorMessage(userStatistics.error)}</PanelMessage>
          ) : userStatistics.data.recentUsers.length === 0 ? (
            <PanelMessage>가입한 회원이 없습니다.</PanelMessage>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {userStatistics.data.recentUsers.map((user) => (
                <li key={user.userId} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate font-medium',
                      user.status === 'WITHDRAWN' ? 'text-gray-400' : 'text-gray-900',
                    )}
                  >
                    {user.nickname}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: USER_PROVIDER_COLORS[user.provider] ?? '#a1a1aa' }}
                    />
                    {USER_PROVIDER_LABELS[user.provider] ?? user.provider}
                  </span>
                  <span className="w-20 shrink-0 text-right text-xs text-gray-400 tabular-nums">
                    {formatShortDateTime(user.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="최근 게시글" href="/posts">
          {recentPosts.isPending ? (
            <ListSkeleton />
          ) : recentPosts.isError ? (
            <PanelMessage isError>{getErrorMessage(recentPosts.error)}</PanelMessage>
          ) : recentPosts.data.data.length === 0 ? (
            <PanelMessage>게시글이 없습니다.</PanelMessage>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {recentPosts.data.data.map((post) => (
                <li key={post.postId} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                    {POST_CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-gray-900">{post.title}</span>
                  <span className="w-20 shrink-0 text-right text-xs text-gray-400 tabular-nums">
                    {formatShortDateTime(post.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}
