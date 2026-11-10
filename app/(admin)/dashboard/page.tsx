'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Info,
  Sparkles,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import DauChart from '@/components/common/chart/DauChart';
import { POST_CATEGORY_LABELS } from '@/constants/post-categories';
import { useDashboardQuery } from '@/hooks/queries/dashboard/useDashboard';
import { useUsersQuery } from '@/hooks/queries/user/useUser';
import { Availability, DailyActiveUsers, DashboardPeriodDays } from '@/types/dashboard.type';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cn } from '@/utils/cn';

const PERIOD_OPTIONS: DashboardPeriodDays[] = [7, 30, 90];
const DEFAULT_PERIOD_DAYS: DashboardPeriodDays = 30;
const WEEKLY_CHART_MIN_DAYS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

const FEATURE_USAGE_ITEMS = [
  { key: 'observationOnly', label: '관찰일지만', color: 'var(--color-primary-600)' },
  {
    key: 'observationAndCommunity',
    label: '관찰일지 + 커뮤니티',
    color: 'var(--color-primary-400)',
  },
  { key: 'communityOnly', label: '커뮤니티만', color: 'var(--color-primary-200)' },
  { key: 'browseOnly', label: '둘러보기만', color: 'var(--color-gray-200)' },
] as const;

function formatPercent(value: number | null, digits = 0) {
  return value === null ? '-' : `${value.toFixed(digits)}%`;
}

function formatShortDate(date: string) {
  return date.slice(5, 10).replace('-', '.');
}

function formatShortDateTime(value: string) {
  return value.slice(5, 16).replace('-', '.').replace('T', ' ');
}

function toLocalDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 수집된 날짜 수. 기간 일부만 수집됐으면 수집된 날만 셉니다.
function getCoveredDays({ status, coveredFrom, coveredTo }: Availability, periodDays: number) {
  if (status !== 'PARTIAL' || !coveredFrom || !coveredTo) return periodDays;
  return (
    Math.round((toLocalDate(coveredTo).getTime() - toLocalDate(coveredFrom).getTime()) / DAY_MS) + 1
  );
}

function getChangePercent(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// 수집 전 날짜(null)가 섞여 있으면 이전 기간과 공정하게 비교할 수 없어 null을 반환합니다.
function getFullAverage(days: DailyActiveUsers[]) {
  if (days.length === 0 || days.some(({ count }) => count === null)) return null;
  return days.reduce((sum, { count }) => sum + (count ?? 0), 0) / days.length;
}

function getCoveredAverage(days: DailyActiveUsers[]) {
  const counts = days.flatMap(({ count }) => (count === null ? [] : [count]));
  if (counts.length === 0) return null;
  return counts.reduce((sum, count) => sum + count, 0) / counts.length;
}

function isCollecting(availability: Availability) {
  return availability.status === 'COLLECTING';
}

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-gray-200/70',
        className,
      )}
    >
      {children}
    </section>
  );
}

function DeltaPill({ value }: { value: number | null }) {
  if (value === null) return null;
  if (Math.abs(value) < 0.05) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        변화 없음
      </span>
    );
  }

  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
        value > 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700',
      )}
    >
      <Icon size={12} strokeWidth={2.5} />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function InfoTip({ text, align = 'center' }: { text: string; align?: 'center' | 'end' }) {
  return (
    <span tabIndex={0} className="group relative inline-flex align-middle outline-none">
      <Info
        size={13}
        className="cursor-help text-gray-300 group-hover:text-gray-500 group-focus:text-gray-500"
      />
      <span
        className={cn(
          'pointer-events-none absolute top-full z-200 mt-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100',
          align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2',
        )}
      >
        {text}
      </span>
    </span>
  );
}

function CoverageBadge({ availability }: { availability: Availability }) {
  if (availability.status !== 'PARTIAL' || !availability.coveredFrom) return null;
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
      {formatShortDate(availability.coveredFrom)}부터 집계
    </span>
  );
}

function CollectingState({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-center"
      style={{ height }}
    >
      <Clock size={20} className="text-gray-300" />
      <p className="text-sm font-medium text-gray-600">데이터를 수집하고 있습니다.</p>
      <p className="text-xs text-gray-400">기록이 쌓이면 표시됩니다.</p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  info,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  info: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon size={15} />
        </span>
        {label}
        <InfoTip text={info} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </Card>
  );
}

function FooterStats({ items }: { items: { label: ReactNode; value: string; extra?: string }[] }) {
  return (
    <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
      {items.map(({ label, value, extra }, index) => (
        <div key={index} className="min-w-0">
          <dt className="flex items-center gap-1 text-xs text-gray-400">{label}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-gray-900 tabular-nums">
            {value}
            {extra && <span className="ml-1 text-xs font-normal text-gray-400">{extra}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function WarningBanner({ info, children }: { info?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-warning-50 px-5 py-3.5 ring-1 ring-warning-500/30">
      <AlertTriangle size={18} className="shrink-0 text-warning-700" />
      <p className="text-sm text-gray-800">{children}</p>
      {info && (
        <span className="ml-auto shrink-0">
          <InfoTip text={info} align="end" />
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [periodDays, setPeriodDays] = useState<DashboardPeriodDays>(DEFAULT_PERIOD_DAYS);
  const dashboard = useDashboardQuery({ periodDays });
  const users = useUsersQuery({ page: 0, size: 1 });

  const totalUserCount = users.data?.totalUserCount ?? null;

  const handlePeriodClick = (value: DashboardPeriodDays) => setPeriodDays(value);

  const renderContent = () => {
    if (dashboard.isPending) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      );
    }

    if (dashboard.isError) {
      return (
        <p className="py-12 text-center text-sm text-danger-700">
          {getErrorMessage(dashboard.error)}
        </p>
      );
    }

    const { asOf, today, cards, dau, featureUsage, regeneration, recentPosts, dataQuality } =
      dashboard.data;

    const isWeekly = periodDays > WEEKLY_CHART_MIN_DAYS;
    const averageDau = getCoveredAverage(dau.current);
    const dauChangePercent = getChangePercent(
      getFullAverage(dau.current),
      getFullAverage(dau.comparison),
    );
    const yesterdayDau = dau.current[dau.current.length - 1]?.count ?? null;

    const hasWritingRate = cards.observationWritingEligibleUsers > 0;
    const regenerationTotal = regeneration.created + regeneration.regenerated;
    const regenerationDays = getCoveredDays(regeneration.availability, periodDays);
    const createdShare = regenerationTotal ? (regeneration.created / regenerationTotal) * 100 : 0;
    const browseOnlyPercent = featureUsage.browseOnly.percent;

    return (
      <div
        className={cn(
          'flex flex-col gap-6 transition-opacity',
          dashboard.isPlaceholderData && 'opacity-60',
        )}
      >
        {/* 오늘: 페이지를 열 때 실시간 집계, 기간 탭과 무관 */}
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            오늘
            <span className="text-xs font-normal text-gray-400">{asOf.slice(11, 16)} 기준</span>
          </p>
          {[
            { label: '가입', value: `${today.signups.toLocaleString()}명` },
            { label: '활성 사용자', value: `${today.activeUsers.toLocaleString()}명` },
            { label: '관찰일지 생성', value: `${today.observationsCreated.toLocaleString()}건` },
          ].map(({ label, value }) => (
            <p key={label} className="flex items-baseline gap-2 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-900 tabular-nums">{value}</span>
            </p>
          ))}
          <span className="ml-auto text-xs text-gray-400">새로고침하면 다시 집계합니다</span>
        </Card>

        {regeneration.warning.warning && (
          <WarningBanner info="어제 생성이 10건 이상이고, 재생성률이 그전 7일보다 10%p 이상 높으면 표시됩니다.">
            <span className="font-semibold">
              어제 관찰일지 재생성률이 {formatPercent(regeneration.warning.yesterdayRatePercent)}
              입니다.
            </span>{' '}
            그전 7일({formatPercent(regeneration.warning.previousSevenDayRatePercent)})보다
            높습니다. AI 결과 품질을 확인해 주세요.
          </WarningBanner>
        )}

        {dataQuality.degraded && (
          <WarningBanner>
            일부 지표에 수집 누락이 확인되어 실제보다 적게 표시될 수 있습니다.
          </WarningBanner>
        )}

        {/* 핵심 숫자: 가입 → 첫 관찰일지 → 탈퇴 순서 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            icon={UserPlus}
            label="신규 가입"
            info={`최근 ${periodDays}일 동안 가입한 회원 수입니다.`}
            value={`${cards.signups.toLocaleString()}명`}
            sub={totalUserCount === null ? '-' : `전체 회원 ${totalUserCount.toLocaleString()}명`}
          />
          <KpiCard
            icon={Sparkles}
            label="관찰일지 작성률"
            info="가입 후 7일 안에 관찰일지를 작성한 회원 비율입니다. 가입 초기 이용을 보는 지표라 7일 이후 작성은 포함하지 않습니다."
            value={
              isCollecting(cards.lifecycleAvailability) || !hasWritingRate
                ? '-'
                : formatPercent(cards.observationWritingRatePercent)
            }
            sub={
              isCollecting(cards.lifecycleAvailability)
                ? '데이터를 수집하고 있습니다'
                : hasWritingRate
                  ? `신규 회원 ${cards.observationWritingEligibleUsers.toLocaleString()}명 기준`
                  : '집계 대상 없음'
            }
          />
          <KpiCard
            icon={UserMinus}
            label="탈퇴"
            info={`최근 ${periodDays}일 동안 탈퇴한 회원 수입니다.`}
            value={`${cards.withdrawals.toLocaleString()}명`}
            sub={
              isCollecting(cards.lifecycleAvailability)
                ? '이용 기록은 수집하고 있습니다'
                : `그중 ${cards.unusedWithdrawals.toLocaleString()}명은 이용 없이 탈퇴`
            }
          />
        </section>

        {/* 활성 사용자 */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="p-6 xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-gray-900">
                    {isWeekly ? '주별 활성 사용자' : '일별 활성 사용자'}
                  </h3>
                  <span className="text-xs text-gray-400">{isWeekly ? '주 평균 DAU' : 'DAU'}</span>
                  <InfoTip text="하루에 한 번 이상 서비스를 이용한 회원 수입니다." />
                  <CoverageBadge availability={dau.availability} />
                </div>
                {!isCollecting(dau.availability) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
                      {averageDau === null ? '-' : `${Math.round(averageDau).toLocaleString()}명`}
                    </span>
                    <DeltaPill value={dauChangePercent} />
                    <span className="text-xs text-gray-400">하루 평균</span>
                  </div>
                )}
              </div>
              {!isCollecting(dau.availability) && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-primary-600" />
                    최근 {periodDays}일
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 border-t-2 border-dashed border-gray-300" />
                    이전 {periodDays}일
                  </span>
                </div>
              )}
            </div>
            <div className="mt-5">
              {isCollecting(dau.availability) ? (
                <CollectingState height={220} />
              ) : (
                <DauChart current={dau.current} comparison={dau.comparison} />
              )}
            </div>
            {!isCollecting(dau.availability) && (
              <FooterStats
                items={[
                  {
                    label: (
                      <>
                        {periodDays}일 활성 사용자
                        <InfoTip
                          text={`최근 ${periodDays}일 동안 1번 이상 이용한 회원 수입니다.`}
                        />
                      </>
                    ),
                    value: `${dau.uniqueActiveUsers.toLocaleString()}명`,
                    extra: totalUserCount
                      ? `전체 회원의 ${Math.round((dau.uniqueActiveUsers / totalUserCount) * 100)}%`
                      : undefined,
                  },
                  {
                    label: (
                      <>
                        재방문율
                        <InfoTip text="지난주 이용한 회원 중 이번 주에도 이용한 비율입니다." />
                      </>
                    ),
                    value: formatPercent(dau.sevenDayRevisitRatePercent),
                  },
                  {
                    label: '어제',
                    value: yesterdayDau === null ? '-' : `${yesterdayDau.toLocaleString()}명`,
                    extra:
                      yesterdayDau === null || averageDau === null
                        ? undefined
                        : `평균보다 ${yesterdayDau >= averageDau ? '많음' : '적음'}`,
                  },
                ]}
              />
            )}
          </Card>

          <Card className="flex flex-col p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-gray-900">활성 사용자가 이용한 기능</h3>
              <InfoTip text="활성 사용자가 어떤 기능을 이용했는지 나눈 비율입니다." />
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              최근 {periodDays}일 기준
            </p>
            {isCollecting(featureUsage.availability) || browseOnlyPercent === null ? (
              <div className="mt-5 flex-1">
                <CollectingState height={240} />
              </div>
            ) : (
              <>
                <div className="mt-5 flex h-3 gap-1">
                  {FEATURE_USAGE_ITEMS.filter(
                    ({ key }) => (featureUsage[key].percent ?? 0) > 0,
                  ).map(({ key, color }) => (
                    <div
                      key={key}
                      className="rounded-full"
                      style={{ width: `${featureUsage[key].percent ?? 0}%`, background: color }}
                    />
                  ))}
                </div>
                <ul className="mt-5 flex flex-col gap-4">
                  {FEATURE_USAGE_ITEMS.map(({ key, label, color }) => (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-gray-600">{label}</span>
                      <span className="ml-auto font-semibold text-gray-900 tabular-nums">
                        {formatPercent(featureUsage[key].percent)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
                  활성 사용자 {formatPercent(browseOnlyPercent)}는 아무 기능도 쓰지 않고 둘러보기만
                  했습니다.
                </p>
              </>
            )}
          </Card>
        </section>

        {/* 관찰일지 품질 / 최근 게시글 */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="flex flex-col p-5">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-gray-900">관찰일지 재생성률</h3>
              <InfoTip text="전체 생성 중 재생성이 차지하는 비율입니다." />
              <span className="text-xs text-gray-400">최근 {periodDays}일</span>
            </div>
            {isCollecting(regeneration.availability) ? (
              <CollectingState height={150} />
            ) : (
              <>
                <p className="text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
                  {formatPercent(regeneration.ratePercent, 1)}
                </p>
                <div className="mt-5 flex h-2.5 gap-1">
                  {regenerationTotal > 0 ? (
                    <>
                      {regeneration.created > 0 && (
                        <div
                          className="rounded-full bg-primary-600"
                          style={{ width: `${createdShare}%` }}
                        />
                      )}
                      {regeneration.regenerated > 0 && (
                        <div className="flex-1 rounded-full bg-primary-200" />
                      )}
                    </>
                  ) : (
                    <div className="flex-1 rounded-full bg-gray-100" />
                  )}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>최초 생성 {regeneration.created.toLocaleString()}건</span>
                  <span>재생성 {regeneration.regenerated.toLocaleString()}건</span>
                </div>
                <div className="mt-auto">
                  <FooterStats
                    items={[
                      { label: '기간 생성', value: `${regenerationTotal.toLocaleString()}건` },
                      {
                        label: '하루 평균 생성',
                        value: `${Math.round(regenerationTotal / regenerationDays).toLocaleString()}건`,
                      },
                      {
                        label: '어제 재생성률',
                        value: formatPercent(regeneration.warning.yesterdayRatePercent),
                      },
                    ]}
                  />
                </div>
              </>
            )}
          </Card>

          <Card className="flex flex-col p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">최근 게시글</h3>
              <Link
                href="/posts"
                className="flex items-center text-xs font-medium text-gray-400 hover:text-gray-900"
              >
                전체 보기
                <ChevronRight size={14} />
              </Link>
            </div>
            {recentPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">게시글이 없습니다.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-gray-100">
                {recentPosts.map((post) => (
                  <li key={post.postId} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {POST_CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-gray-900">{post.title}</span>
                    <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                      댓글 {post.commentCount.toLocaleString()}
                    </span>
                    <span className="w-[72px] shrink-0 text-right text-xs text-gray-400 tabular-nums">
                      {formatShortDateTime(post.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">서비스 이용 현황을 한눈에 확인합니다.</p>
        </div>
        <div
          role="group"
          aria-label="조회 기간"
          className="flex rounded-full bg-white p-1 ring-1 ring-gray-200/70"
        >
          {PERIOD_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={periodDays === value}
              onClick={() => handlePeriodClick(value)}
              className={cn(
                'h-8 rounded-full px-4 text-sm font-medium transition-colors',
                periodDays === value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {value}일
            </button>
          ))}
        </div>
      </header>

      {renderContent()}
    </div>
  );
}
